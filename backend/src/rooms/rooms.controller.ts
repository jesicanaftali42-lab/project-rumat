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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { FilterRoomsDto } from './dto/filter-rooms.dto';
import { RolesGuard } from '../auth/roles.guard'; 

@ApiTags('Rooms')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('rooms')
export class RoomsController {
  constructor(private readonly service: RoomsService) {}

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

  @Get('availability')
  availabilityBulk(@Query('date') date: string, @Query('floor') floor?: string) {
    return this.service.getAvailabilityBulk({
      date,
      floor: floor ? Number(floor) : undefined,
    });
  }

  @Get('floors')
  floors() { return this.service.getFloors(); }

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id/availability')
  availability(@Param('id') id: string, @Query('date') date: string) {
    return this.service.getAvailability(Number(id), date);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(Number(id)); }

  // =========================================================
  // 🔒 RESTRICTED AREA (HANYA SUPER ADMIN)
  // =========================================================

  // ✅ Create Room
  @UseGuards(RolesGuard) 
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  create(
    @Body() dto: CreateRoomDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    // 👇 LOGIKA SIMPAN URL GAMBAR
    if (file) {
      // Pastikan port sesuai dengan backend kamu (3000)
      dto.image_url = `http://localhost:3000/uploads/${file.filename}`;
    }
    
    return this.service.create(dto);
  }

  // ✅ Update Room
  @UseGuards(RolesGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  update(
    @Param('id') id: string, 
    @Body() dto: UpdateRoomDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    // 👇 LOGIKA SIMPAN URL GAMBAR SAAT UPDATE
    if (file) {
      dto.image_url = `http://localhost:3000/uploads/${file.filename}`;
    }
    
    return this.service.update(Number(id), dto);
  }

  // ✅ Delete Room
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}