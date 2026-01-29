import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { BookingStatus } from '../booking-status.enum';

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BookingStatus, example: BookingStatus.APPROVED })
  @IsEnum(BookingStatus)
  status: BookingStatus;
}
