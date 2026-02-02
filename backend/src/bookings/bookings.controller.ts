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
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt')) // semua endpoint booking wajib login
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

  // ✅ USER: Schedule buat page Room Schedule
  // contoh: /bookings/schedule?date=2026-01-30&floor=6
  @Get('schedule')
  getSchedule(@Query() query: GetScheduleDto) {
    return this.service.getSchedule(query);
  }

  // ✅ ADMIN & SUPER_ADMIN: lihat semua booking
  @UseGuards(new RolesGuard(['admin', 'super_admin']))
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // ⚠️ taruh ini di bawah schedule biar ga ketabrak route
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  // ✅ ADMIN & SUPER_ADMIN: approve/reject booking
  @UseGuards(new RolesGuard(['admin', 'super_admin']))
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateBookingStatusDto) {
    return this.service.updateStatus(Number(id), dto.status);
  }

  // ✅ DELETE booking:
  // - user boleh delete bookingnya sendiri
  // - admin/super_admin boleh delete semua
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.sub;
    const role = req.user.role;
    return this.service.remove(Number(id), userId, role);
  }
}
