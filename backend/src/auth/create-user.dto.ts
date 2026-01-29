import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'jesica' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'jesica123' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'user', required: false })
  @IsOptional()
  @IsIn(['user', 'admin', 'super_admin'])
  role?: string;
}
