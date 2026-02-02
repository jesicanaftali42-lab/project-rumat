import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { GetScheduleDto } from './dto/get-schedule.dto';

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

  // ✅ Schedule (buat tab Schedule di frontend)
  // contoh: /bookings/schedule?date=2026-01-30&floor=6
  @Get('schedule')
  getSchedule(@Query() query: GetScheduleDto) {
    return this.service.getSchedule(query);
  }

  // ✅ Semua booking (buat admin panel / schedule list)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // ⚠️ taruh ini di bawah schedule biar ga ketabrak route
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
