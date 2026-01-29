import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty({ example: 'Cemara Room' })
  name: string;

  @Column()
  @ApiProperty({ example: 6 })
  floor: number;

  @Column({ default: 0 })
  @ApiProperty({ example: 20 })
  capacity: number;

  // ✅ ini yang dimaksud mentor: facilities bentuk array/list
  @Column('text', { array: true, default: [] })
  @ApiProperty({ example: ['TV', 'AC', 'WiFi'], isArray: true })
  facilities: string[];

  @Column({ default: true })
  @ApiProperty({ example: true })
  isAvailable: boolean;
}
