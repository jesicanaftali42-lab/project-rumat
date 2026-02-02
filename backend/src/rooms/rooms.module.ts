import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { Booking } from '../bookings/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Booking])],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}
