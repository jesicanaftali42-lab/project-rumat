import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBookingInfoDto {
  @ApiPropertyOptional({ example: 'SIT' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ example: 'Pagi' })
  @IsOptional()
  @IsString()
  session?: string;

  @ApiPropertyOptional({ example: 'Catatan tambahan' })
  @IsOptional()
  @IsString()
  notes?: string;
}
