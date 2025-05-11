import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('vehicles')
export class Vehicle {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  type: string;

  @ApiProperty()
  @Column('decimal')
  maxWeight: number;

  @ApiProperty()
  @Column('decimal')
  currentLatitude: number;

  @ApiProperty()
  @Column('decimal')
  currentLongitude: number;

  @ApiProperty()
  @Column()
  status: string;

  @ApiProperty()
  @Column({ nullable: true })
  currentOrderId: number;

  @ApiProperty()
  @Column('decimal')
  currentWeight: number;
} 