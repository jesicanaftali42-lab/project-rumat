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
import { FilterRoomsDto } from './dto/filter-rooms.dto';

@ApiTags('Rooms')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('rooms')
export class RoomsController {
  constructor(private readonly service: RoomsService) {}

  // ✅ FILTER rooms
  @Get('filter')
  filter(@Query() query: FilterRoomsDto) {
    return this.service.filterRooms({
      floor: query.floor ? Number(query.floor) : undefined,
      available:
        query.available === undefined
          ? undefined
          : query.available === 'true' || query.available === '1',
      search: query.search,
    });
  }

  // ✅ BULK availability semua room dalam 1 request
  // contoh: GET /rooms/availability?date=2026-01-29&floor=6
  @Get('availability')
  availabilityBulk(
    @Query('date') date: string,
    @Query('floor') floor?: string,
  ) {
    return this.service.getAvailabilityBulk({
      date,
      floor: floor ? Number(floor) : undefined,
    });
  }

  // ✅ list semua lantai unik (buat dropdown frontend)
  @Get('floors')
  floors() {
    return this.service.getFloors();
  }

  // ✅ semua user login boleh lihat rooms
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // ✅ availability room per tanggal (per 1 room)
  @Get(':id/availability')
  availability(@Param('id') id: string, @Query('date') date: string) {
    return this.service.getAvailability(Number(id), date);
  }

  // ✅ detail room
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
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
