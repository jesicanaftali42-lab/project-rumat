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
import { UpdateBookingInfoDto } from './dto/update-booking-info.dto';
import { GetScheduleDto } from './dto/get-schedule.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt')) 
@Controller('bookings')
export class BookingsController {
  constructor(private readonly service: BookingsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateBookingDto) {
    const userId = req.user.sub;
    return this.service.create(userId, dto);
  }

  @Get('my')
  my(@Req() req: any) {
    const userId = req.user.sub;
    return this.service.myBookings(userId);
  }

  @Get('schedule')
  getSchedule(@Query() query: GetScheduleDto) {
    return this.service.getSchedule(query);
  }

  @UseGuards(new RolesGuard(['admin', 'super_admin']))
  @Get('admin/stats')
  adminStats() {
    return this.service.adminStats();
  }

  @UseGuards(new RolesGuard(['admin', 'super_admin']))
  @Get()
  findAllAdmin(@Query() query: QueryBookingsDto) {
    return this.service.findAllAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @UseGuards(new RolesGuard(['admin', 'super_admin']))
  @Patch(':id')
  updateBookingInfo(
    @Param('id') id: string,
    @Body() dto: UpdateBookingInfoDto,
  ) {
    return this.service.updateBookingInfo(Number(id), dto);
  }

  @UseGuards(new RolesGuard(['admin', 'super_admin']))
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateBookingStatusDto) {
    return this.service.updateStatus(Number(id), dto.status);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.sub;
    const role = req.user.role;
    return this.service.remove(Number(id), userId, role);
  }
}
