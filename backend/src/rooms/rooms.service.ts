import { Injectable, NotFoundException } from '@nestjs/common';
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

  // ✅ availability yang beneran
  async getAvailability(roomId: number, date: string) {
    const room = await this.findOne(roomId);

    // booking yang dianggap ngeblok ruangan
    // (pending + approved, karena pending pun harus dianggap "nahan slot")
    const bookings = await this.bookingRepo.find({
      where: {
        room: { id: roomId },
        meetingDate: date,
        status: BookingStatus.APPROVED,
      },
      order: { startTime: 'ASC' },
    });

    // definisi slot
    const morningSlot = { start: '07:00', end: '12:00' };
    const afternoonSlot = { start: '12:00', end: '16:00' };

    // overlap checker
    const isOverlap = (
      slotStart: string,
      slotEnd: string,
      bookingStart: string,
      bookingEnd: string,
    ) => {
      return slotStart < bookingEnd && slotEnd > bookingStart;
    };

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
}
