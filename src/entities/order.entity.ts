import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('orders')
export class Order {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  customerId: number;

  @ApiProperty()
  @Column()
  vendorId: number;

  @ApiProperty()
  @Column('decimal')
  weight: number;

  @ApiProperty()
  @Column()
  status: string;

  @ApiProperty()
  @Column({ nullable: true })
  assignedVehicleId: number;

  @ApiProperty()
  @Column('decimal')
  pickupLatitude: number;

  @ApiProperty()
  @Column('decimal')
  pickupLongitude: number;

  @ApiProperty()
  @Column('decimal')
  deliveryLatitude: number;

  @ApiProperty()
  @Column('decimal')
  deliveryLongitude: number;

  @ApiProperty()
  @Column()
  createdAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  completedAt: Date | null;
} 