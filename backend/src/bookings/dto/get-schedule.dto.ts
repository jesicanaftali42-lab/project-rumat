import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumberString } from 'class-validator';

export class GetScheduleDto {
  @ApiPropertyOptional({ example: '2026-01-30' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @IsNumberString()
  floor?: string;
}
