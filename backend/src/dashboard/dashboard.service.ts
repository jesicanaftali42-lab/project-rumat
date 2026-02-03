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

    const pending = await this.bookingRepo.count({
      where: { status: BookingStatus.PENDING },
    });

    const approved = await this.bookingRepo.count({
      where: { status: BookingStatus.APPROVED },
    });

    const rejected = await this.bookingRepo.count({
      where: { status: BookingStatus.REJECTED },
    });

    const done = await this.bookingRepo.count({
      where: { status: BookingStatus.DONE },
    });

    return {
      totalRequest,
      pending,
      approved,
      rejected,
      done,
    };
  }

  async todaySchedule(params?: { date?: string; limit?: number }) {
    const date = params?.date || new Date().toISOString().slice(0, 10);
    const limit = params?.limit ?? 5;

    const bookings = await this.bookingRepo.find({
      where: {
        meetingDate: date,
        status: BookingStatus.APPROVED,
      },
      order: {
        startTime: 'ASC',
      },
      take: limit,
    });

    return bookings.map((b) => ({
      id: b.id,
      meetingTitle: b.meetingTitle,
      meetingDate: b.meetingDate,
      startTime: b.startTime,
      endTime: b.endTime,
      department: b.department ?? null,
      session: b.session ?? null,
      status: b.status,
      room: b.room
        ? {
            id: b.room.id,
            name: b.room.name,
            floor: b.room.floor,
          }
        : null,
      user: b.user
        ? {
            id: b.user.id,
            username: b.user.username,
            role: b.user.role,
          }
        : null,
    }));
  }

  async bookingsPerMonth(year?: number) {
    const y = year ?? new Date().getFullYear();

    const rows = await this.bookingRepo
      .createQueryBuilder('b')
      .select(`EXTRACT(MONTH FROM b.meetingDate)`, 'month')
      .addSelect('COUNT(*)', 'total')
      .where(`EXTRACT(YEAR FROM b.meetingDate) = :year`, { year: y })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    const result = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: 0,
    }));

    for (const r of rows) {
      const m = Number(r.month);
      const total = Number(r.total);

      if (m >= 1 && m <= 12) {
        result[m - 1].total = total;
      }
    }

    return result;
  }

  async departmentStats(year?: number) {
    const y = year ?? new Date().getFullYear();

    const rows = await this.bookingRepo
      .createQueryBuilder('b')
      .select(`COALESCE(b.department, 'UNKNOWN')`, 'department')
      .addSelect('COUNT(*)', 'total')
      .where(`EXTRACT(YEAR FROM b.meetingDate) = :year`, { year: y })
      .groupBy('department')
      .orderBy('total', 'DESC')
      .getRawMany();

    return rows.map((r) => ({
      department: r.department,
      total: Number(r.total),
    }));
  }

  // ✅ Meeting Room Stats (bar chart): total booking per room
  async roomStats(year?: number) {
    const y = year ?? new Date().getFullYear();

    const rows = await this.bookingRepo
      .createQueryBuilder('b')
      .leftJoin('b.room', 'room')
      .select('room.id', 'roomId')
      .addSelect('room.name', 'roomName')
      .addSelect('COUNT(*)', 'total')
      .where(`EXTRACT(YEAR FROM b.meetingDate) = :year`, { year: y })
      .groupBy('room.id')
      .addGroupBy('room.name')
      .orderBy('total', 'DESC')
      .getRawMany();

    return rows.map((r) => ({
      roomId: Number(r.roomId),
      roomName: r.roomName,
      total: Number(r.total),
    }));
  }
}
