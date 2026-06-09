import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: 'Cemara Room' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 6 })
  @Type(() => Number)
  @IsNumber()
  floor: number;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  capacity?: number;

  @ApiProperty({ example: ['TV', 'AC', 'WiFi'], required: false, isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facilities?: string[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isAvailable?: boolean;

  // 👇 TAMBAHAN BARU: Field untuk menyimpan URL gambar
  @ApiProperty({ example: 'http://localhost:3000/uploads/image.jpg', required: false })
  @IsOptional()
  @IsString()
  image_url?: string;
}