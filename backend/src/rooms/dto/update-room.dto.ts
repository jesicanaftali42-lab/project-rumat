import { PartialType } from '@nestjs/swagger'; // 👈 PENTING: Pakai @nestjs/swagger
import { CreateRoomDto } from './create-room.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
    // Kita tambahkan ini eksplisit biar aman saat update gambar saja
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    image_url?: string;
}