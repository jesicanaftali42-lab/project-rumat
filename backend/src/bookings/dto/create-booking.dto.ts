import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  roomId: number;

  @ApiProperty({ example: 'Vendor Discussion' })
  @IsNotEmpty()
  @IsString()
  meetingTitle: string;

  @ApiProperty({ example: '2026-01-29' })
  @IsNotEmpty()
  @IsString()
  meetingDate: string;

  @ApiProperty({ example: '09:00' })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({ example: '10:00' })
  @IsNotEmpty()
  @IsString()
  endTime: string;

  @ApiProperty({ example: 'Diskusi project', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
