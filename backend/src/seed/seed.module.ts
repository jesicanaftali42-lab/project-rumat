import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Room } from '../rooms/room.entity';
import { User } from '../auth/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, User])],
  providers: [SeedService],
})
export class SeedModule {}
