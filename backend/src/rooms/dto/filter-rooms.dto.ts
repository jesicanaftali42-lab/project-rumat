import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export class FilterRoomsDto {
  @ApiPropertyOptional({ example: '6' })
  @IsOptional()
  @IsNumberString()
  floor?: string;

  @ApiPropertyOptional({ example: 'true', enum: ['true', 'false', '1', '0'] })
  @IsOptional()
  @IsIn(['true', 'false', '1', '0'])
  available?: string;

  @ApiPropertyOptional({ example: 'cem' })
  @IsOptional()
  @IsString()
  search?: string;
}
