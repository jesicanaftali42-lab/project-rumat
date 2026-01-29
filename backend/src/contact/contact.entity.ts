import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty({ example: 'Princess Lulu' })
  name: string;

  @Column({ unique: true })
  @ApiProperty({ example: 'princess@gmail.com' })
  email: string;

  @Column()
  @ApiProperty({ example: '08123456789' })
  phone: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'Medan', required: false })
  address?: string;
}
