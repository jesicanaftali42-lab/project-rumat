import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User } from './user.entity'; // Pastikan path entity benar
import { LoginDto } from './login.dto';
import { CreateUserDto } from './create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // --- HELPER TOKEN ---
  private async signAccessToken(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      division: user.division,
    };
    return this.jwtService.signAsync(payload, { expiresIn: '1d' });
  }

  private async signRefreshToken(user: User) {
    const payload = { sub: user.id };
    return this.jwtService.signAsync(payload, { expiresIn: '7d' });
  }

  // --- 1. REGISTER ---
  async register(data: CreateUserDto) {
    const exist = await this.usersRepository.findOneBy({
      username: data.username,
    });

    if (exist) {
      throw new BadRequestException('Username sudah digunakan!');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Buat user baru (Default role: employee)
    const user = this.usersRepository.create({
      username: data.username,
      password: hashedPassword,
      email: (data as any).email || `${data.username}@rumate.com`,
      role: (data as any).role || 'employee',
      division: (data as any).division || 'General',
    });

    const saved = await this.usersRepository.save(user);

    return {
      id: saved.id,
      username: saved.username,
      role: saved.role,
      division: saved.division,
    };
  }

  // --- 2. LOGIN ---
  async login(data: LoginDto) {
    const user = await this.usersRepository.findOneBy({
      username: data.username,
    });

    if (!user) {
      throw new UnauthorizedException('Username tidak ditemukan!');
    }

    const passwordValid = await bcrypt.compare(data.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Password salah!');
    }

    // [AUTO-FIX] Jika login sebagai 'Master', paksa jadi Super Admin
    if (user.username === 'Master' && user.role !== 'super_admin') {
      console.log("⚠️ SYSTEM ALERT: User 'Master' detected. Promoting to Super Admin...");
      user.role = 'super_admin';
      user.division = 'IT Master';
      await this.usersRepository.save(user);
    }

    const access_token = await this.signAccessToken(user);
    const refresh_token = await this.signRefreshToken(user);

    const refreshTokenHash = await bcrypt.hash(refresh_token, 10);
    await this.usersRepository.update(user.id, { refreshTokenHash } as any);

    return {
      status: 'Berhasil Login',
      access_token,
      refresh_token,
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      division: user.division,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
    };
  }

  // --- 3. REFRESH TOKEN ---
  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException('User not found');

    const hash = (user as any).refreshTokenHash;
    if (!hash) throw new UnauthorizedException('Refresh token tidak ditemukan');

    const valid = await bcrypt.compare(refreshToken, hash);
    if (!valid) throw new UnauthorizedException('Refresh token invalid');

    const access_token = await this.signAccessToken(user);
    const new_refresh_token = await this.signRefreshToken(user);

    const newHash = await bcrypt.hash(new_refresh_token, 10);
    await this.usersRepository.update(user.id, { refreshTokenHash: newHash } as any);

    return { access_token, refresh_token: new_refresh_token };
  }

  // --- 4. LOGOUT ---
  async logout(userId: number) {
    await this.usersRepository.update(userId, { refreshTokenHash: null } as any);
    return { message: 'Logout berhasil' };
  }

  // --- 5. [BACKDOOR] PROMOTE TO SUPER ADMIN ---
  // Fungsi ini dipanggil lewat URL untuk mengatasi masalah user pertama
  async promoteToSuperAdmin(email: string) {
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      throw new NotFoundException(`User dengan email ${email} tidak ditemukan! Pastikan sudah Register.`);
    }

    user.role = 'super_admin';
    user.division = 'IT Master';
    
    await this.usersRepository.save(user);

    return {
      status: 'SUCCESS',
      message: `User ${user.username} (${user.email}) sekarang adalah SUPER ADMIN. Silakan Login ulang.`,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      }
    };
  }
}