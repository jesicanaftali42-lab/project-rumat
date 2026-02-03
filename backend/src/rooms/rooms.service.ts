import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Room } from './room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

import { Booking } from '../bookings/booking.entity';
import { BookingStatus } from '../bookings/booking-status.enum';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly repo: Repository<Room>,

    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  // ✅ list lantai unik (buat dropdown frontend)
  async getFloors() {
    const rows = await this.repo
      .createQueryBuilder('room')
      .select('DISTINCT room.floor', 'floor')
      .orderBy('room.floor', 'ASC')
      .getRawMany();

    return rows.map((r) => Number(r.floor));
  }

  // ✅ FILTER rooms (buat frontend)
  async filterRooms(params?: {
    floor?: number;
    available?: boolean;
    search?: string;
  }) {
    const qb = this.repo.createQueryBuilder('room');

    if (params?.floor !== undefined) {
      qb.andWhere('room.floor = :floor', { floor: params.floor });
    }

    if (params?.available !== undefined) {
      qb.andWhere('room.isAvailable = :available', {
        available: params.available,
      });
    }

    if (params?.search) {
      qb.andWhere('room.name ILIKE :search', { search: `%${params.search}%` });
    }

    return qb
      .orderBy('room.floor', 'ASC')
      .addOrderBy('room.name', 'ASC')
      .getMany();
  }

  async findOne(id: number) {
    const room = await this.repo.findOneBy({ id });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  create(dto: CreateRoomDto) {
    const room = this.repo.create(dto);
    return this.repo.save(room);
  }

  async update(id: number, dto: UpdateRoomDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.delete(id);
    return { message: 'Room deleted' };
  }

  // ✅ availability per 1 room
  async getAvailability(roomId: number, date: string) {
    const room = await this.findOne(roomId);

    const bookings = await this.bookingRepo.find({
      where: {
        room: { id: roomId },
        meetingDate: date,
        status: BookingStatus.APPROVED,
      },
      order: { startTime: 'ASC' },
    });

    const morningSlot = { start: '07:00', end: '12:00' };
    const afternoonSlot = { start: '12:00', end: '16:00' };

    const isOverlap = (
      slotStart: string,
      slotEnd: string,
      bookingStart: string,
      bookingEnd: string,
    ) => slotStart < bookingEnd && slotEnd > bookingStart;

    const morningBooked = bookings.some((b) =>
      isOverlap(morningSlot.start, morningSlot.end, b.startTime, b.endTime),
    );

    const afternoonBooked = bookings.some((b) =>
      isOverlap(afternoonSlot.start, afternoonSlot.end, b.startTime, b.endTime),
    );

    return {
      room: {
        id: room.id,
        name: room.name,
        floor: room.floor,
      },
      date,
      morningAvailable: !morningBooked,
      afternoonAvailable: !afternoonBooked,
      bookings: bookings.map((b) => ({
        id: b.id,
        meetingTitle: b.meetingTitle,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
      })),
    };
  }

  // ✅ BULK availability: semua room dalam 1 request
  async getAvailabilityBulk(params: { date: string; floor?: number }) {
    const { date, floor } = params;

    if (!date) throw new BadRequestException('date query is required');

    // ambil rooms (optional filter floor)
    const roomQb = this.repo.createQueryBuilder('room');
    if (floor !== undefined) {
      roomQb.where('room.floor = :floor', { floor });
    }
    const rooms = await roomQb.orderBy('room.name', 'ASC').getMany();

    if (rooms.length === 0) return [];

    // ambil semua booking approved pada tanggal itu untuk rooms tsb
    const roomIds = rooms.map((r) => r.id);

    const bookings = await this.bookingRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.room', 'room')
      .where('b.meetingDate = :date', { date })
      .andWhere('b.status = :status', { status: BookingStatus.APPROVED })
      .andWhere('room.id IN (:...roomIds)', { roomIds })
      .orderBy('b.startTime', 'ASC')
      .getMany();

    const morningSlot = { start: '07:00', end: '12:00' };
    const afternoonSlot = { start: '12:00', end: '16:00' };

    const isOverlap = (
      slotStart: string,
      slotEnd: string,
      bookingStart: string,
      bookingEnd: string,
    ) => slotStart < bookingEnd && slotEnd > bookingStart;

    // group booking by roomId
    const bookingByRoom: Record<number, Booking[]> = {};
    for (const b of bookings) {
      const rid = b.room?.id;
      if (!rid) continue;
      if (!bookingByRoom[rid]) bookingByRoom[rid] = [];
      bookingByRoom[rid].push(b);
    }

    // hasil final
    return rooms.map((room) => {
      const roomBookings = bookingByRoom[room.id] || [];

      const morningBooked = roomBookings.some((b) =>
        isOverlap(morningSlot.start, morningSlot.end, b.startTime, b.endTime),
      );

      const afternoonBooked = roomBookings.some((b) =>
        isOverlap(afternoonSlot.start, afternoonSlot.end, b.startTime, b.endTime),
      );

      return {
        room: {
          id: room.id,
          name: room.name,
          floor: room.floor,
          capacity: room.capacity,
          facilities: room.facilities,
          isAvailable: room.isAvailable,
        },
        date,
        morningAvailable: !morningBooked,
        afternoonAvailable: !afternoonBooked,
        bookings: roomBookings.map((b) => ({
          id: b.id,
          meetingTitle: b.meetingTitle,
          startTime: b.startTime,
          endTime: b.endTime,
          status: b.status,
        })),
      };
    });
  }
}
