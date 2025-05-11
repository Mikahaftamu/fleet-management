import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ example: 'Truck', description: 'Type of the vehicle' })
  type: string;

  @ApiProperty({ example: 5000, description: 'Maximum weight capacity in kg' })
  maxWeight: number;

  @ApiProperty({ example: 13.4966, description: 'Initial latitude' })
  currentLatitude: number;

  @ApiProperty({ example: 39.4753, description: 'Initial longitude' })
  currentLongitude: number;

  @ApiProperty({ example: 'available', description: 'Initial status of the vehicle' })
  status: string;
}

export class UpdateVehicleDto {
  @ApiProperty({ example: 'Truck', description: 'Type of the vehicle', required: false })
  type?: string;

  @ApiProperty({ example: 5000, description: 'Maximum weight capacity in kg', required: false })
  maxWeight?: number;

  @ApiProperty({ example: 'busy', description: 'Status of the vehicle', required: false })
  status?: string;
}

export class VehicleResponseDto {
  @ApiProperty({ example: 1, description: 'Unique identifier of the vehicle' })
  id: number;

  @ApiProperty({ example: 'Truck', description: 'Type of the vehicle' })
  type: string;

  @ApiProperty({ example: 5000, description: 'Maximum weight capacity in kg' })
  maxWeight: number;

  @ApiProperty({ example: 13.4966, description: 'Current latitude' })
  currentLatitude: number;

  @ApiProperty({ example: 39.4753, description: 'Current longitude' })
  currentLongitude: number;

  @ApiProperty({ example: 'available', description: 'Current status of the vehicle' })
  status: string;

  @ApiProperty({ example: 0, description: 'Current weight being carried' })
  currentWeight: number;

  @ApiProperty({ example: 0, description: 'ID of the current order being delivered' })
  currentOrderId: number;
} 