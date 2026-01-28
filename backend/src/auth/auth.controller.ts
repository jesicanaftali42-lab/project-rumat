import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './create-user.dto';
import { LoginDto } from './login.dto'; // Import formulir login

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Tombol Register
  @Post('register')
  async register(@Body() data: CreateUserDto) {
    return this.authService.register(data);
  }

  // Tombol Login (BARU)
  @Post('login')
  async login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }
}