import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'; 
import { Booking } from '../bookings/booking.entity'; 

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

  // ✅ KHUSUS POSTGRESQL: Gunakan tipe 'text' dengan opsi array: true
  // Ini jauh lebih canggih daripada 'simple-array' milik MySQL
  @Column('text', { array: true, default: [] }) 
  @ApiProperty({ example: ['TV', 'AC', 'WiFi'], isArray: true })
  facilities: string[];

  @Column({ default: true })
  @ApiProperty({ example: true })
  isAvailable: boolean;

  // 👇 Kolom untuk menyimpan link gambar
  @Column({ nullable: true }) 
  @ApiProperty({ example: 'http://localhost:3000/uploads/foto.jpg', required: false })
  image_url: string;

  // 👇 Relasi ke Booking
  @OneToMany(() => Booking, (booking) => booking.room)
  bookings: Booking[];
}