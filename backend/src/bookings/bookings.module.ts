import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Booking } from './booking.entity';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

import { User } from '../auth/user.entity';
import { Room } from '../rooms/room.entity';
import { Department } from '../departments/department.entity'; // ✅ NEW

@Module({
  imports: [TypeOrmModule.forFeature([Booking, User, Room, Department])], // ✅ NEW
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
