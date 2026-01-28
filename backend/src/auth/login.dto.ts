import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'jesica' })
  username: string;

  @ApiProperty({ example: 'jesica123' })
  password: string;
}