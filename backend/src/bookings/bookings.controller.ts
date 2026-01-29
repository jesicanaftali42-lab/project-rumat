import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('bookings')
export class BookingsController {
  constructor(private readonly service: BookingsService) {}

  // ✅ USER: buat booking
  @Post()
  create(@Req() req: any, @Body() dto: CreateBookingDto) {
    const userId = req.user.sub;
    return this.service.create(userId, dto);
  }

  // ✅ USER: booking milik sendiri
  @Get('my')
  my(@Req() req: any) {
    const userId = req.user.sub;
    return this.service.myBookings(userId);
  }

  // ✅ ADMIN (sementara semua user bisa lihat dulu, nanti kita bikin role guard)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  // ✅ ADMIN: approve/reject booking
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateBookingStatusDto) {
    return this.service.updateStatus(Number(id), dto.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
