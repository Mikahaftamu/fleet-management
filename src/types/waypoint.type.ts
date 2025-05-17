export interface DirectionStep {
  distance: number;
  duration: number;
  instruction: string;
  name: string;
  type: string;
}

export interface Waypoint {
  type: 'pickup' | 'delivery';
  latitude: number;
  longitude: number;
  orderId: number;
  estimatedTime?: number;
  step: number;
  instructions: string;
  distance: number;
  // Direction-specific properties
  directionSteps?: DirectionStep[];
  totalDuration?: number;
} 