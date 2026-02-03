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
import { Department } from '../departments/department.entity'; // ✅ NEW

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

  // ✅ relasi ke master department (dropdown)
  @ManyToOne(() => Department, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @ApiProperty({ required: false })
  departmentRef?: Department;

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

  // ✅ tetap dipakai untuk backward compatibility (dashboard lama)
  @Column({ nullable: true })
  @ApiProperty({ example: 'SIT', required: false })
  department?: string;

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
