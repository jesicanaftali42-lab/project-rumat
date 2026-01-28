import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './user.entity'; // Import User

@Module({
  imports: [TypeOrmModule.forFeature([User])], // <--- KUNCI: Izin akses tabel User
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}