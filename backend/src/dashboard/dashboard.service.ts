import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../bookings/booking.entity';
import { BookingStatus } from '../bookings/booking-status.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
  ) {}

  async summary() {
    const totalRequest = await this.bookingRepo.count();

    const approved = await this.bookingRepo.count({
      where: { status: BookingStatus.APPROVED },
    });

    const pending = await this.bookingRepo.count({
      where: { status: BookingStatus.PENDING },
    });

    const rejected = await this.bookingRepo.count({
      where: { status: BookingStatus.REJECTED },
    });

    const upcomingMeetings = await this.bookingRepo.find({
      where: { status: BookingStatus.APPROVED },
      order: { meetingDate: 'ASC', startTime: 'ASC' },
      take: 5,
    });

    return {
      totalRequest,
      approved,
      pending,
      rejected,
      upcomingMeetings,
    };
  }
}
