import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../auth/user.entity';
import { Room } from '../rooms/room.entity';
import { BookingStatus } from './booking-status.enum';

@Entity('bookings')
@Index(['meetingDate'])
export class Booking {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  // relasi ke user
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @ApiProperty()
  user: User;

  // relasi ke room
  @ManyToOne(() => Room, { eager: true, onDelete: 'CASCADE' })
  @ApiProperty()
  room: Room;

  @Column()
  @ApiProperty({ example: 'Vendor Discussion' })
  meetingTitle: string;

  @Column({ type: 'date' })
  @ApiProperty({ example: '2026-01-29' })
  meetingDate: string;

  @Column()
  @ApiProperty({ example: '09:00' })
  startTime: string;

  @Column()
  @ApiProperty({ example: '10:00' })
  endTime: string;

  // ✅ buat UI "Seksi" misal SIT / SIS / HC
  @Column({ nullable: true })
  @ApiProperty({ example: 'SIT', required: false })
  department?: string;

  // ✅ buat UI "Sesi" misal Pagi / Siang / Sore
  @Column({ nullable: true })
  @ApiProperty({ example: 'Pagi', required: false })
  session?: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'Diskusi project', required: false })
  notes?: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  @ApiProperty({ enum: BookingStatus, example: BookingStatus.PENDING })
  status: BookingStatus;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;
}
