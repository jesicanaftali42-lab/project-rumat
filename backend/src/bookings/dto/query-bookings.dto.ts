import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export class QueryBookingsDto {
  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ example: '10' })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  // filter
  @ApiPropertyOptional({ example: 'PENDING' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: '2026-01-29' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ example: '6' })
  @IsOptional()
  @IsNumberString()
  floor?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsNumberString()
  roomId?: string;

  @ApiPropertyOptional({ example: 'SIT' })
  @IsOptional()
  @IsString()
  department?: string;

  // search keyword
  @ApiPropertyOptional({ example: 'jesica' })
  @IsOptional()
  @IsString()
  search?: string;

  // sorting
  @ApiPropertyOptional({ example: 'createdAt', enum: ['createdAt', 'startTime', 'meetingDate'] })
  @IsOptional()
  @IsIn(['createdAt', 'startTime', 'meetingDate'])
  sortBy?: string;

  @ApiPropertyOptional({ example: 'DESC', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';
}
