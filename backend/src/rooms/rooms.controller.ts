import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Rooms')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt')) // ✅ biar gak nulis berulang2 di tiap endpoint
@Controller('rooms')
export class RoomsController {
  constructor(private readonly service: RoomsService) {}

  // ✅ semua user login boleh lihat rooms
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  // ✅ availability room per tanggal
  // contoh: GET /rooms/1/availability?date=2026-01-30
  @Get(':id/availability')
  availability(@Param('id') id: string, @Query('date') date: string) {
    return this.service.getAvailability(Number(id), date);
  }

  // ✅ hanya admin & super_admin boleh create room
  @UseGuards(new RolesGuard(['admin', 'super_admin']))
  @Post()
  create(@Body() dto: CreateRoomDto) {
    return this.service.create(dto);
  }

  // ✅ hanya admin & super_admin boleh update room
  @UseGuards(new RolesGuard(['admin', 'super_admin']))
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.service.update(Number(id), dto);
  }

  // ✅ delete room: hanya super_admin
  @UseGuards(new RolesGuard(['super_admin']))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
