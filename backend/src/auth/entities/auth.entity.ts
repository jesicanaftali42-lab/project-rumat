import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users') // Pastikan nama tabelnya sesuai ('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  // 👇👇👇 BAGIAN INI PASTI HILANG KAN? TAMBAHKAN INI: 👇👇👇
  @Column({ default: 'user' })
  role: string;

  @Column({ nullable: true })
  refreshTokenHash: string;
}
