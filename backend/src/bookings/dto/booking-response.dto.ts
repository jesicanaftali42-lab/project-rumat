import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../booking-status.enum';

class BookingRoomDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() floor: number;
}

class BookingUserDto {
  @ApiProperty() id: number;
  @ApiProperty() username: string;
  @ApiProperty() role: string;
}

export class BookingResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() meetingTitle: string;
  @ApiProperty() meetingDate: string;
  @ApiProperty() startTime: string;
  @ApiProperty() endTime: string;

  @ApiProperty({ nullable: true }) department: string | null;
  @ApiProperty({ nullable: true }) session: string | null;
  @ApiProperty({ nullable: true }) notes: string | null;

  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;

  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  @ApiProperty({ type: BookingRoomDto })
  room: BookingRoomDto;

  @ApiProperty({ type: BookingUserDto })
  user: BookingUserDto;
}
