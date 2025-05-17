import { IsNumber, IsNotEmpty, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AreaQueryDto {
  @ApiProperty({
    description: 'North coordinate (latitude)',
    example: 13.5400,
    minimum: -90,
    maximum: 90
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-90)
  @Max(90)
  north: number;

  @ApiProperty({
    description: 'South coordinate (latitude)',
    example: 13.4900,
    minimum: -90,
    maximum: 90
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-90)
  @Max(90)
  south: number;

  @ApiProperty({
    description: 'East coordinate (longitude)',
    example: 39.5000,
    minimum: -180,
    maximum: 180
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-180)
  @Max(180)
  east: number;

  @ApiProperty({
    description: 'West coordinate (longitude)',
    example: 39.4600,
    minimum: -180,
    maximum: 180
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-180)
  @Max(180)
  west: number;
} 