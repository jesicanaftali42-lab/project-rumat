import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ unique: true })
  @ApiProperty({ example: 'SIT' })
  code: string;

  @Column()
  @ApiProperty({ example: 'Sistem Informasi & Teknologi' })
  name: string;

  @Column({ default: true })
  @ApiProperty({ example: true })
  isActive: boolean;
}
