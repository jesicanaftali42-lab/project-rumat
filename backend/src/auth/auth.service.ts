import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { LoginDto } from './login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // --- REGISTER ---
  async register(data: any) {
    return this.usersRepository.save(data);
  }

  // --- LOGIN (LOGIKA BARU) ---
  async login(data: LoginDto) {
    // 1. Cari user berdasarkan username
    const user = await this.usersRepository.findOneBy({ username: data.username });

    // 2. Cek apakah user ketemu?
    if (!user) {
      throw new UnauthorizedException('Username tidak ditemukan!');
    }

    // 3. Cek apakah password cocok?
    if (user.password !== data.password) {
      throw new UnauthorizedException('Password salah bos!');
    }

    // 4. Kalau semua benar, kembalikan data user
    return {
      status: 'Berhasil Login',
      data: user
    };
  }
}