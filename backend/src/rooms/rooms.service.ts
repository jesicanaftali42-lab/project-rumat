import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
  ) {}

  create(dto: CreateRoomDto) {
    const room = this.roomRepo.create(dto);
    return this.roomRepo.save(room);
  }

  findAll() {
    return this.roomRepo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const room = await this.roomRepo.findOneBy({ id });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async update(id: number, dto: UpdateRoomDto) {
    await this.findOne(id);
    await this.roomRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.roomRepo.delete(id);
    return { message: 'Room deleted' };
  }
}
