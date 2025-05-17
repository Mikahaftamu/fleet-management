import { IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DirectionsQueryDto {
  @ApiProperty({
    description: 'Starting latitude',
    example: 13.4966,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  startLat: number;

  @ApiProperty({
    description: 'Starting longitude',
    example: 39.4753,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  startLng: number;

  @ApiProperty({
    description: 'Ending latitude',
    example: 13.5100,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  endLat: number;

  @ApiProperty({
    description: 'Ending longitude',
    example: 39.4800,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  endLng: number;
} 