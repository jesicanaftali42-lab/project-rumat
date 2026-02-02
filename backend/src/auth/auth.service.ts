import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity'; // Pastikan path ini benar
import { LoginDto } from './login.dto'; // Pastikan path ini benar
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // --- REGISTER ---
  async register(data: any) {
    const exist = await this.usersRepository.findOneBy({ username: data.username });
    if (exist) {
      throw new BadRequestException('Username sudah digunakan!');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.usersRepository.create({
      username: data.username,
      password: hashedPassword,
      role: data.role ?? 'user',
    });

    const saved = await this.usersRepository.save(user);

    // jangan balikin password ke frontend
    const { password, ...result } = saved;
    return result;
  }

  // --- LOGIN ---
  async login(data: LoginDto) {
    const user = await this.usersRepository.findOneBy({ username: data.username });

    if (!user) {
      throw new UnauthorizedException('Username tidak ditemukan!');
    }

    const passwordValid = await bcrypt.compare(data.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Password salah!');
    }

    // payload token
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const access_token = await this.jwtService.signAsync(payload);

    // === BAGIAN INI SAYA UBAH BIAR FRONTEND LANGSUNG BACA ===
    return {
      status: 'Berhasil Login',
      access_token: access_token,
      // Kita taruh di luar (jangan dibungkus objek 'user' lagi)
      id: user.id,       
      username: user.username,
      role: user.role,    
    };
  }
}