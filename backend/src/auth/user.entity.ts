import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
// Hapus import Booking kalau error/belum butuh, tapi kalau ada relasi biarkan
// import { Booking } from '../bookings/booking.entity'; 

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ type: 'text', nullable: true })
  refreshTokenHash: string | null;

  // 👇 KOLOM BARU (Profil)
  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  division: string;

  @Column({ nullable: true })
  officeLocation: string;

  @Column({ type: 'text', nullable: true })
  avatar: string;
}