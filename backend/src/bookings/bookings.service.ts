import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { User } from '../auth/user.entity';
import { Room } from '../rooms/room.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from './booking-status.enum';
import { GetScheduleDto } from './dto/get-schedule.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
  ) {}

  // USER: buat booking
  async create(userId: number, dto: CreateBookingDto) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const room = await this.roomRepo.findOneBy({ id: dto.roomId });
    if (!room) throw new NotFoundException('Room not found');

    // ✅ Cek bentrok jadwal: same room + same date + time overlap
    const conflict = await this.bookingRepo
      .createQueryBuilder('b')
      .leftJoin('b.room', 'room')
      .where('room.id = :roomId', { roomId: dto.roomId })
      .andWhere('b.meetingDate = :meetingDate', { meetingDate: dto.meetingDate })
      .andWhere('b.status IN (:...statuses)', {
        statuses: [BookingStatus.PENDING, BookingStatus.APPROVED],
      })
      .andWhere(`(b.startTime < :endTime AND b.endTime > :startTime)`, {
        startTime: dto.startTime,
        endTime: dto.endTime,
      })
      .getOne();

    if (conflict) {
      throw new BadRequestException('Room sudah dibooking pada jam tersebut');
    }

    const booking = this.bookingRepo.create({
      user,
      room,
      meetingTitle: dto.meetingTitle,
      meetingDate: dto.meetingDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      notes: dto.notes,
      status: BookingStatus.PENDING,
    });

    return this.bookingRepo.save(booking);
  }

  // USER: lihat booking sendiri
  myBookings(userId: number) {
    return this.bookingRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  // ✅ Schedule untuk tab Schedule di frontend
  // contoh: /bookings/schedule?date=2026-01-30&floor=6
  async getSchedule(query: GetScheduleDto) {
    const { date, floor } = query;

    const qb = this.bookingRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.room', 'room')
      .leftJoinAndSelect('b.user', 'user')
      .where('b.meetingDate = :date', { date })
      .andWhere('b.status IN (:...statuses)', {
        statuses: [BookingStatus.PENDING, BookingStatus.APPROVED],
      });

    if (floor) {
      qb.andWhere('room.floor = :floor', { floor: Number(floor) });
    }

    const data = await qb.orderBy('b.startTime', 'ASC').getMany();

    // response aman (tanpa password)
    return data.map((b) => ({
      id: b.id,
      meetingTitle: b.meetingTitle,
      meetingDate: b.meetingDate,
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status,

      room: {
        id: b.room?.id,
        name: b.room?.name,
        floor: b.room?.floor,
      },

      user: {
        id: b.user?.id,
        username: b.user?.username,
        role: b.user?.role,
      },
    }));
  }

  // ADMIN: lihat semua booking
  findAll() {
    return this.bookingRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const booking = await this.bookingRepo.findOneBy({ id });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  // ADMIN: approve/reject
  async updateStatus(id: number, status: BookingStatus) {
    const booking = await this.findOne(id);
    booking.status = status;
    return this.bookingRepo.save(booking);
  }

  // ✅ DELETE booking:
  // - user biasa hanya boleh hapus booking miliknya sendiri
  // - admin & super_admin boleh hapus semua
  async remove(id: number, userId: number, role: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!booking) throw new NotFoundException('Booking not found');

    // ✅ user biasa tidak boleh hapus booking orang lain
    if (role === 'user') {
      if (booking.user.id !== userId) {
        throw new BadRequestException(
          'Kamu tidak boleh menghapus booking orang lain',
        );
      }
    }

    await this.bookingRepo.delete(id);
    return { message: 'Booking deleted' };
  }
}
