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
import { Department } from '../departments/department.entity';

import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from './booking-status.enum';
import { GetScheduleDto } from './dto/get-schedule.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { UpdateBookingInfoDto } from './dto/update-booking-info.dto';
import { BookingResponseDto } from './dto/booking-response.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,

    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
  ) {}

  // ✅ MAPPER (UPDATE: Tambah Data User Lengkap)
  private toResponse(b: Booking): BookingResponseDto {
    return {
      id: b.id,
      meetingTitle: b.meetingTitle,
      meetingDate: b.meetingDate,
      startTime: b.startTime,
      endTime: b.endTime,
      department: b.department ?? null,
      session: b.session ?? null,
      notes: b.notes ?? null,
      status: b.status,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      room: {
        id: b.room?.id,
        name: b.room?.name,
        floor: b.room?.floor,
      },
      // 👇 PERBAIKAN DISINI: Sertakan Data Profil User!
      user: {
        id: b.user?.id,
        username: b.user?.username,
        role: b.user?.role,
        fullName: b.user?.fullName, // Biar muncul nama asli
        division: b.user?.division, // Biar kolom Divisi di tabel Admin gak N/A
        avatar: b.user?.avatar,     // Biar foto profil muncul (opsional)
      },
    };
  }

  // ✅ ADMIN: Stats Dashboard
  async adminStats() {
    const total = await this.bookingRepo.count();
    const pending = await this.bookingRepo.count({ where: { status: BookingStatus.PENDING } });
    const approved = await this.bookingRepo.count({ where: { status: BookingStatus.APPROVED } });
    const rejected = await this.bookingRepo.count({ where: { status: BookingStatus.REJECTED } });
    const done = await this.bookingRepo.count({ where: { status: BookingStatus.DONE } });

    return { total, pending, approved, rejected, done };
  }

  // ✅ ADMIN & DASHBOARD: Ambil Semua Data
  async findAll() {
    const bookings = await this.bookingRepo.find({
      relations: ['user', 'room'], 
      order: {
        meetingDate: 'DESC', // Ubah ke DESC biar yang terbaru muncul duluan
        startTime: 'ASC',
      },
    });

    return bookings.map((b) => this.toResponse(b));
  }

  // ✅ USER: Create Booking
  async create(userId: number, dto: CreateBookingDto) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const room = await this.roomRepo.findOneBy({ id: dto.roomId });
    if (!room) throw new NotFoundException('Room not found');

    // Cek Bentrok Jadwal
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

    // Resolve Department (Opsional)
    let departmentRef: Department | null = null;
    if ((dto as any).departmentId) {
      departmentRef = await this.departmentRepo.findOneBy({
        id: Number((dto as any).departmentId),
      });
      if (!departmentRef) throw new NotFoundException('Department not found');
    }

    const booking = new Booking();
    booking.user = user;
    booking.room = room;
    booking.meetingTitle = dto.meetingTitle;
    booking.meetingDate = dto.meetingDate;
    booking.startTime = dto.startTime;
    booking.endTime = dto.endTime;

    (booking as any).departmentRef = departmentRef ?? undefined;
    booking.department = departmentRef?.code ?? dto.department;

    booking.session = dto.session;
    booking.notes = dto.notes;
    booking.status = BookingStatus.PENDING;

    const saved = await this.bookingRepo.save(booking);
    // Return respons lengkap dengan relasi (perlu fetch ulang atau construct manual)
    // Cara cepat: construct manual karena object user & room sudah ada
    return this.toResponse({ ...saved, user, room } as Booking);
  }

  // ✅ USER: My Bookings
  async myBookings(userId: number) {
    const rows = await this.bookingRepo.find({
      where: { user: { id: userId } },
      relations: ['user', 'room'],
      order: { createdAt: 'DESC' },
    });

    return rows.map((b) => this.toResponse(b));
  }

  // ✅ PUBLIC: Schedule View
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
    return data.map((b) => this.toResponse(b));
  }

  // ✅ ADMIN: Advanced Find
  async findAllAdmin(query: QueryBookingsDto) {
    const page = Number(query.page || 1);
    const limit = Math.min(Number(query.limit || 10), 100);
    const skip = (page - 1) * limit;

    const qb = this.bookingRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.user', 'user')
      .leftJoinAndSelect('b.room', 'room');

    if (query.status) qb.andWhere('b.status = :status', { status: query.status });
    if (query.date) qb.andWhere('b.meetingDate = :date', { date: query.date });
    if (query.floor) qb.andWhere('room.floor = :floor', { floor: Number(query.floor) });
    if (query.roomId) qb.andWhere('room.id = :roomId', { roomId: Number(query.roomId) });
    if (query.department) qb.andWhere('b.department = :department', { department: query.department });

    if (query.search) {
      qb.andWhere(
        `(user.username ILIKE :search OR b.meetingTitle ILIKE :search OR room.name ILIKE :search)`,
        { search: `%${query.search}%` },
      );
    }

    const sortBy = query.sortBy || 'createdAt';
    const order = query.order || 'DESC';
    qb.orderBy(`b.${sortBy}`, order);

    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map((b) => this.toResponse(b)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['user', 'room'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  // ✅ ADMIN: Update Info Booking
  async updateBookingInfo(id: number, dto: UpdateBookingInfoDto) {
    const booking = await this.findOne(id);
    if (dto.department !== undefined) booking.department = dto.department;
    if (dto.session !== undefined) booking.session = dto.session;
    if (dto.notes !== undefined) booking.notes = dto.notes;
    const saved = await this.bookingRepo.save(booking);
    return this.toResponse(saved);
  }

  // ✅ ADMIN: Approve/Reject
  async updateStatus(id: number, status: BookingStatus) {
    const booking = await this.findOne(id);
    booking.status = status;
    const saved = await this.bookingRepo.save(booking);
    return this.toResponse(saved);
  }

  // ✅ ADMIN/USER: Hapus Booking
  async remove(id: number, userId: number, role: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!booking) throw new NotFoundException('Booking not found');

    if (role === 'user') {
      if (booking.user.id !== userId) {
        throw new BadRequestException('Kamu tidak boleh menghapus booking orang lain');
      }
    }

    await this.bookingRepo.delete(id);
    return { message: 'Booking deleted' };
  }
}