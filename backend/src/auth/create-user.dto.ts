import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'jesica' })
  username: string;

  @ApiProperty({ example: 'jesica123' })
  password: string;

  @ApiProperty({ example: 'user' })
  role: string;
}