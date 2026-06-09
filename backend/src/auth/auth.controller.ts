import { Body, Controller, Get, Post, Req, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { CreateUserDto } from './create-user.dto';
import { LoginDto } from './login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() data: CreateUserDto) {
    return this.authService.register(data);
  }

  @Post('login')
  async login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  // ✅ Get User Profile (Protected)
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Req() req: any) {
    return {
      id: req.user.sub,
      username: req.user.username,
      role: req.user.role,
      division: req.user.division,
    };
  }

  // 🔥 [BACKDOOR] SETUP SUPER ADMIN (PUBLIC)
  // Akses via Browser: http://localhost:3000/auth/setup-super-admin?email=admin@rumate.com
  @Get('setup-super-admin')
  async setupSuperAdmin(@Query('email') email: string) {
    return this.authService.promoteToSuperAdmin(email);
  }
}