import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User } from './user.entity';
import { LoginDto } from './login.dto';
import { CreateUserDto } from './create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  private async signAccessToken(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: '1d',
    });
  }

  private async signRefreshToken(user: User) {
    const payload = {
      sub: user.id,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });
  }

  // ✅ REGISTER (default role = user)
  async register(data: CreateUserDto) {
    const exist = await this.usersRepository.findOneBy({
      username: data.username,
    });

    if (exist) {
      throw new BadRequestException('Username sudah digunakan!');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.usersRepository.create({
      username: data.username,
      password: hashedPassword,
      role: 'user',
    });

    const saved = await this.usersRepository.save(user);

    return {
      id: saved.id,
      username: saved.username,
      role: saved.role,
    };
  }

  // ✅ LOGIN
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

    const access_token = await this.signAccessToken(user);
    const refresh_token = await this.signRefreshToken(user);

    // Simpan refresh token hash ke DB
    const refreshTokenHash = await bcrypt.hash(refresh_token, 10);
    await this.usersRepository.update(user.id, {
      refreshTokenHash,
    } as any);

    // ⬇️ Response dibuat sederhana agar frontend mudah baca
    return {
      status: 'Berhasil Login',
      access_token,
      refresh_token,
      id: user.id,
      username: user.username,
      role: user.role,
    };
  }

  // ✅ REFRESH TOKEN
  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const hash = (user as any).refreshTokenHash;
    if (!hash) {
      throw new UnauthorizedException('Refresh token tidak ditemukan');
    }

    const valid = await bcrypt.compare(refreshToken, hash);
    if (!valid) {
      throw new UnauthorizedException('Refresh token invalid');
    }

    const access_token = await this.signAccessToken(user);
    const new_refresh_token = await this.signRefreshToken(user);

    const newHash = await bcrypt.hash(new_refresh_token, 10);
    await this.usersRepository.update(user.id, {
      refreshTokenHash: newHash,
    } as any);

    return {
      access_token,
      refresh_token: new_refresh_token,
    };
  }

  // ✅ LOGOUT
  async logout(userId: number) {
    await this.usersRepository.update(userId, {
      refreshTokenHash: null,
    } as any);

    return { message: 'Logout berhasil' };
  }
}
