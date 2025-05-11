export interface Waypoint {
  type: 'pickup' | 'delivery';
  latitude: number;
  longitude: number;
  orderId: number;
  estimatedTime?: number;
  step: number;
  instructions: string;
  distance: number;
} 