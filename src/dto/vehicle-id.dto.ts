import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class VehicleIdParam {
  @ApiProperty({
    description: 'Vehicle ID',
    example: 1,
    type: Number,
  })
  @Type(() => Number)
  @IsInt({ message: 'Vehicle ID must be an integer' })
  @IsPositive({ message: 'Vehicle ID must be a positive number' })
  vehicleId: number;
} 