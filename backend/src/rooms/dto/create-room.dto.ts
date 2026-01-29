import { ApiProperty } from '@nestjs/swagger';
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
  name: string;

  @ApiProperty({ example: 6 })
  @IsNumber()
  floor: number;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  // ✅ facilities: ["TV","AC"]
  @ApiProperty({ example: ['TV', 'AC', 'WiFi'], required: false, isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facilities?: string[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
