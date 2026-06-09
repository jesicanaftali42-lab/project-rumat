import { 
  Body, 
  Controller, 
  Param, 
  Patch, 
  Get, 
  Post, 
  Delete, 
  UseGuards 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport'; // 👈 Ganti import ini
import { RolesGuard } from '../auth/roles.guard'; // Pastikan RolesGuard path-nya benar

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // --- 1. GET ALL USERS (HANYA SUPER ADMIN) ---
  @UseGuards(AuthGuard('jwt'), RolesGuard) // 👈 Pakai AuthGuard('jwt') langsung
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // --- 2. GET USER BY ID (AUTHENTICATED USER) ---
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(parseInt(id));
  }

  // --- 3. CREATE USER (HANYA SUPER ADMIN) ---
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  create(@Body() body: any) {
    return this.usersService.create(body);
  }

  // --- 4. UPDATE USER (HANYA SUPER ADMIN) ---
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(parseInt(id), body);
  }

  // --- 5. DELETE USER (HANYA SUPER ADMIN) ---
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(parseInt(id));
  }
}