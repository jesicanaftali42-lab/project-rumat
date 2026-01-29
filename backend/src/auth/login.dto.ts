import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'jesica' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'jesica123' })
  @IsNotEmpty()
  password: string;
}
