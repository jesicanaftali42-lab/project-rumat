import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.entity.js';
import { User } from '../auth/user.entity.js';
import { Room } from '../rooms/room.entity.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { BookingStatus } from './booking-status.enum.js';

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
      .andWhere('b.status IN (:...statuses)', { statuses: [BookingStatus.PENDING, BookingStatus.APPROVED] })
      .andWhere(
        `(b.startTime < :endTime AND b.endTime > :startTime)`,
        { startTime: dto.startTime, endTime: dto.endTime },
      )
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

    // kalau mau reject/approve ya boleh
    booking.status = status;

    return this.bookingRepo.save(booking);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.bookingRepo.delete(id);
    return { message: 'Booking deleted' };
  }
}
