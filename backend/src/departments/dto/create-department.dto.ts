import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'SIT' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ example: 'Sistem Informasi & Teknologi' })
  @IsNotEmpty()
  @IsString()
  name: string;
}
