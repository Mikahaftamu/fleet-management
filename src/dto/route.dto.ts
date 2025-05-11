import { ApiProperty } from '@nestjs/swagger';
import { Waypoint } from '../types/waypoint.type';

export class WaypointDto {
  @ApiProperty({ example: 'pickup', description: 'Type of waypoint (pickup/delivery)' })
  type: string;

  @ApiProperty({ example: 13.4966, description: 'Latitude of the waypoint' })
  latitude: number;

  @ApiProperty({ example: 39.4753, description: 'Longitude of the waypoint' })
  longitude: number;

  @ApiProperty({ example: 1, description: 'ID of the associated order' })
  orderId: number;

  @ApiProperty({ example: 30, description: 'Estimated time to reach this waypoint in minutes' })
  estimatedTime: number;

  @ApiProperty({ example: 1, description: 'Step number in the route' })
  step: number;

  @ApiProperty({ example: 'Drive to pickup location', description: 'Instructions for this waypoint' })
  instructions: string;

  @ApiProperty({ example: 5.2, description: 'Distance to this waypoint in kilometers' })
  distance: number;
}

export class RouteResponseDto {
  @ApiProperty({ type: 'object', description: 'Vehicle information' })
  vehicle: any;

  @ApiProperty({ type: [WaypointDto], description: 'List of waypoints in the route' })
  waypoints: Waypoint[];
}

export class AnalyticsResponseDto {
  @ApiProperty({ example: 'day', description: 'Time period of the analytics' })
  period: string;

  @ApiProperty({ example: 10, description: 'Total number of vehicles' })
  totalVehicles: number;

  @ApiProperty({ example: 5, description: 'Number of available vehicles' })
  availableVehicles: number;

  @ApiProperty({ example: 3, description: 'Number of busy vehicles' })
  busyVehicles: number;

  @ApiProperty({ example: 2, description: 'Number of vehicles in maintenance' })
  maintenanceVehicles: number;

  @ApiProperty({ example: 30, description: 'Vehicle utilization percentage' })
  utilization: number;

  @ApiProperty({ example: 50, description: 'Total number of orders' })
  totalOrders: number;

  @ApiProperty({ example: 30, description: 'Number of completed orders' })
  completedOrders: number;

  @ApiProperty({ example: 15, description: 'Number of pending orders' })
  pendingOrders: number;

  @ApiProperty({ example: 5, description: 'Number of in-progress orders' })
  inProgressOrders: number;

  @ApiProperty({ example: 60, description: 'Order completion rate percentage' })
  completionRate: number;
} 