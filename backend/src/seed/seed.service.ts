import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../rooms/room.entity';
import { User } from '../auth/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedUsers();
    await this.seedRooms();
  }

  // ✅ seed admin & superadmin (TIDAK TERGANTUNG count user)
  async seedUsers() {
    const adminExist = await this.userRepo.findOne({
      where: { username: 'admin' },
    });

    const superExist = await this.userRepo.findOne({
      where: { username: 'superadmin' },
    });

    if (adminExist && superExist) {
      console.log('✅ Admin & Superadmin sudah ada, seed users dilewati');
      return;
    }

    console.log('🌱 Seeding default users (admin & super_admin)...');

    // ✅ buat admin kalau belum ada
    if (!adminExist) {
      const adminPass = await bcrypt.hash('admin123', 10);

      await this.userRepo.save({
        username: 'admin',
        password: adminPass,
        role: 'admin',
      });

      console.log('✅ Admin dibuat');
    }

    // ✅ buat superadmin kalau belum ada
    if (!superExist) {
      const superPass = await bcrypt.hash('superadmin123', 10);

      await this.userRepo.save({
        username: 'superadmin',
        password: superPass,
        role: 'super_admin',
      });

      console.log('✅ Superadmin dibuat');
    }
  }

  // ✅ seed default rooms
  async seedRooms() {
    const count = await this.roomRepo.count();

    if (count > 0) {
      console.log('✅ Rooms sudah ada, seed rooms dilewati');
      return;
    }

    console.log('🌱 Seeding default rooms...');

    await this.roomRepo.save([
      {
        name: 'Cemara Room',
        floor: 6,
        capacity: 20,
        facilities: ['TV', 'AC', 'WiFi'],
        isAvailable: true,
      },
      {
        name: 'Akasia Room',
        floor: 6,
        capacity: 30,
        facilities: ['TV', 'AC', 'WiFi'],
        isAvailable: true,
      },
      {
        name: 'Mahoni Room',
        floor: 7,
        capacity: 15,
        facilities: ['TV', 'WiFi', 'Projector'],
        isAvailable: true,
      },
      {
        name: 'Beringin Room',
        floor: 6,
        capacity: 10,
        facilities: ['TV', 'WiFi'],
        isAvailable: true,
      },
    ]);

    console.log('✅ Seed rooms berhasil!');
  }
}
