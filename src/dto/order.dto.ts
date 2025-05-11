import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export enum OrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export class StatusUpdateDto {
  @ApiProperty({
    enum: OrderStatus,
    description: 'New status of the order',
    example: OrderStatus.IN_PROGRESS
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({
    description: 'ID of the assigned vehicle',
    required: false,
    example: 1
  })
  @IsNumber()
  @IsOptional()
  vehicleId?: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: 'ID of the customer' })
  customerId: number;

  @ApiProperty({ example: 1, description: 'ID of the vendor' })
  vendorId: number;

  @ApiProperty({ example: 500, description: 'Weight of the order in kg' })
  weight: number;

  @ApiProperty({ example: 13.4966, description: 'Pickup location latitude' })
  pickupLatitude: number;

  @ApiProperty({ example: 39.4753, description: 'Pickup location longitude' })
  pickupLongitude: number;

  @ApiProperty({ example: 13.4966, description: 'Delivery location latitude' })
  deliveryLatitude: number;

  @ApiProperty({ example: 39.4753, description: 'Delivery location longitude' })
  deliveryLongitude: number;
}

export class UpdateOrderDto {
  @ApiProperty({ example: 'in_progress', description: 'New status of the order', required: false })
  status?: string;

  @ApiProperty({ example: 1, description: 'ID of the assigned vehicle', required: false })
  assignedVehicleId?: number;
}

export class OrderResponseDto {
  @ApiProperty({ example: 1, description: 'Unique identifier of the order' })
  id: number;

  @ApiProperty({ example: 1, description: 'ID of the customer' })
  customerId: number;

  @ApiProperty({ example: 1, description: 'ID of the vendor' })
  vendorId: number;

  @ApiProperty({ example: 500, description: 'Weight of the order in kg' })
  weight: number;

  @ApiProperty({ example: 'pending', description: 'Current status of the order' })
  status: string;

  @ApiProperty({ example: 1, description: 'ID of the assigned vehicle' })
  assignedVehicleId: number;

  @ApiProperty({ example: 13.4966, description: 'Pickup location latitude' })
  pickupLatitude: number;

  @ApiProperty({ example: 39.4753, description: 'Pickup location longitude' })
  pickupLongitude: number;

  @ApiProperty({ example: 13.4966, description: 'Delivery location latitude' })
  deliveryLatitude: number;

  @ApiProperty({ example: 39.4753, description: 'Delivery location longitude' })
  deliveryLongitude: number;

  @ApiProperty({ example: '2024-03-20T10:00:00Z', description: 'Order creation timestamp' })
  createdAt: Date;

  @ApiProperty({ example: '2024-03-20T11:00:00Z', description: 'Order completion timestamp', nullable: true })
  completedAt: Date | null;
} 