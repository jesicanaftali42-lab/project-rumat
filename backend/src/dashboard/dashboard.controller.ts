import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('summary')
  summary() {
    return this.service.summary();
  }

  @Get('today-schedule')
  todaySchedule(
    @Query('date') date?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.todaySchedule({
      date,
      limit: limit ? Number(limit) : 5,
    });
  }

  @Get('bookings-per-month')
  bookingsPerMonth(@Query('year') year?: string) {
    return this.service.bookingsPerMonth(year ? Number(year) : undefined);
  }

  @Get('department-stats')
  departmentStats(@Query('year') year?: string) {
    return this.service.departmentStats(year ? Number(year) : undefined);
  }

  // ✅ endpoint meeting room stats
  @Get('room-stats')
  roomStats(@Query('year') year?: string) {
    return this.service.roomStats(year ? Number(year) : undefined);
  }
}
