import { Injectable } from '@nestjs/common';
import { DistanceUtil } from '../utils/distance.util';
import { Order } from '../entities/order.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { Waypoint, DirectionStep } from '../types/waypoint.type';
import { DirectionsService } from './directions.service';

@Injectable()
export class RouteOptimizerService {
  constructor(private readonly directionsService: DirectionsService) {}

  optimizeRoute(vehicle: Vehicle, orders: Order[]): Order[] {
    const unassignedOrders = [...orders];
    const optimizedRoute: Order[] = [];
    let currentLocation = {
      lat: vehicle.currentLatitude,
      lon: vehicle.currentLongitude,
    };
    let currentWeight = 0;

    while (unassignedOrders.length > 0) {
      const orderPoints = unassignedOrders
        .filter(order => currentWeight + order.weight <= vehicle.maxWeight)
        .map((order) => ({
          id: order.id,
          lat: order.pickupLatitude,
          lon: order.pickupLongitude,
        }));

      if (orderPoints.length === 0) {
        break;
      }

      const nearest = DistanceUtil.findNearestPoint(currentLocation, orderPoints);
      const nextOrder = unassignedOrders.find((order) => order.id === nearest.id);

      if (nextOrder) {
        optimizedRoute.push(nextOrder);
        currentWeight += nextOrder.weight;
        currentLocation = {
          lat: nextOrder.deliveryLatitude,
          lon: nextOrder.deliveryLongitude,
        };
        unassignedOrders.splice(
          unassignedOrders.findIndex((order) => order.id === nextOrder.id),
          1,
        );
      }
    }

    return optimizedRoute;
  }

  optimizeMultiVehicleRoutes(vehicles: Vehicle[], orders: Order[]): Map<number, Order[]> {
    const vehicleRoutes = new Map<number, Order[]>();
    const unassignedOrders = [...orders];
    const availableVehicles = [...vehicles];

    while (unassignedOrders.length > 0 && availableVehicles.length > 0) {
      const vehicle = availableVehicles.reduce((prev, current) => 
        (current.maxWeight > prev.maxWeight) ? current : prev
      );

      const route = this.optimizeRoute(vehicle, unassignedOrders);
      if (route.length > 0) {
        vehicleRoutes.set(vehicle.id, route);
        route.forEach(order => {
          const index = unassignedOrders.findIndex(o => o.id === order.id);
          if (index !== -1) {
            unassignedOrders.splice(index, 1);
          }
        });
      }
      
      const vehicleIndex = availableVehicles.findIndex(v => v.id === vehicle.id);
      if (vehicleIndex !== -1) {
        availableVehicles.splice(vehicleIndex, 1);
      }
    }

    return vehicleRoutes;
  }

  async generateWaypoints(route: Order[]): Promise<Waypoint[]> {
    if (!route || route.length === 0) {
      return [];
    }

    const waypoints: Waypoint[] = [];
    let currentLocation = {
      lat: route[0].pickupLatitude,
      lon: route[0].pickupLongitude,
    };
    let stepNumber = 1;

    for (const order of route) {
      try {
        // Calculate distance to pickup
        const pickupDistance = DistanceUtil.calculateDistance(
          currentLocation.lat,
          currentLocation.lon,
          order.pickupLatitude,
          order.pickupLongitude,
        );
        const pickupTime = this.estimateTime(pickupDistance);
        
        // Try to get directions using the direction service
        let pickupDirectionSteps: DirectionStep[] = [];
        let actualPickupTime = pickupTime;
        
        try {
          const pickupDirections = await this.directionsService.getDirections(
            currentLocation.lat,
            currentLocation.lon,
            order.pickupLatitude,
            order.pickupLongitude,
          );
          
          if (pickupDirections && pickupDirections.summary && typeof pickupDirections.summary.duration === 'number') {
            // Extract steps from the directions response
            pickupDirectionSteps = this.extractDirectionSteps(pickupDirections);
            actualPickupTime = pickupDirections.summary.duration / 60; // Convert to minutes
          } else {
            console.log('Using fallback estimated time for pickup route');
          }
        } catch (error) {
          console.log(`Directions API error (pickup): ${error.message}. Using fallback estimated time.`);
        }
        
        // Add pickup waypoint
        waypoints.push({
          type: 'pickup',
          latitude: order.pickupLatitude,
          longitude: order.pickupLongitude,
          orderId: order.id,
          estimatedTime: actualPickupTime,
          step: stepNumber++,
          instructions: `Drive to pickup location for Order #${order.id}. Distance: ${pickupDistance.toFixed(2)} km, Estimated time: ${actualPickupTime.toFixed(0)} minutes`,
          distance: pickupDistance,
          directionSteps: pickupDirectionSteps,
          totalDuration: actualPickupTime,
        });

        // Calculate distance to delivery
        const deliveryDistance = DistanceUtil.calculateDistance(
          order.pickupLatitude,
          order.pickupLongitude,
          order.deliveryLatitude,
          order.deliveryLongitude,
        );
        const deliveryTime = this.estimateTime(deliveryDistance);
        
        // Try to get directions using the direction service
        let deliveryDirectionSteps: DirectionStep[] = [];
        let actualDeliveryTime = deliveryTime;
        
        try {
          const deliveryDirections = await this.directionsService.getDirections(
            order.pickupLatitude,
            order.pickupLongitude,
            order.deliveryLatitude,
            order.deliveryLongitude,
          );
          
          if (deliveryDirections && deliveryDirections.summary && typeof deliveryDirections.summary.duration === 'number') {
            // Extract steps from the directions response
            deliveryDirectionSteps = this.extractDirectionSteps(deliveryDirections);
            actualDeliveryTime = deliveryDirections.summary.duration / 60; // Convert to minutes
          } else {
            console.log('Using fallback estimated time for delivery route');
          }
        } catch (error) {
          console.log(`Directions API error (delivery): ${error.message}. Using fallback estimated time.`);
        }

        // Add delivery waypoint
        waypoints.push({
          type: 'delivery',
          latitude: order.deliveryLatitude,
          longitude: order.deliveryLongitude,
          orderId: order.id,
          estimatedTime: actualDeliveryTime,
          step: stepNumber++,
          instructions: `Deliver Order #${order.id} to customer. Distance: ${deliveryDistance.toFixed(2)} km, Estimated time: ${actualDeliveryTime.toFixed(0)} minutes`,
          distance: deliveryDistance,
          directionSteps: deliveryDirectionSteps,
          totalDuration: actualDeliveryTime,
        });

        currentLocation = {
          lat: order.deliveryLatitude,
          lon: order.deliveryLongitude,
        };
      } catch (error) {
        console.error(`Error processing order ${order.id}: ${error.message}`);
        // Continue with next order in case of error
      }
    }

    // Add return to base instruction if needed
    if (route.length > 0) {
      try {
        const returnDistance = DistanceUtil.calculateDistance(
          currentLocation.lat,
          currentLocation.lon,
          route[0].pickupLatitude,
          route[0].pickupLongitude,
        );
        const returnTime = this.estimateTime(returnDistance);

        // Try to get directions for return journey
        let returnDirectionSteps: DirectionStep[] = [];
        let actualReturnTime = returnTime;
        
        try {
          const returnDirections = await this.directionsService.getDirections(
            currentLocation.lat,
            currentLocation.lon,
            route[0].pickupLatitude,
            route[0].pickupLongitude,
          );
          
          if (returnDirections && returnDirections.summary && typeof returnDirections.summary.duration === 'number') {
            // Extract steps from the directions response
            returnDirectionSteps = this.extractDirectionSteps(returnDirections);
            actualReturnTime = returnDirections.summary.duration / 60; // Convert to minutes
          } else {
            console.log('Using fallback estimated time for return route');
          }
        } catch (error) {
          console.log(`Directions API error (return): ${error.message}. Using fallback estimated time.`);
        }

        waypoints.push({
          type: 'delivery',
          latitude: route[0].pickupLatitude,
          longitude: route[0].pickupLongitude,
          orderId: 0,
          estimatedTime: actualReturnTime,
          step: stepNumber,
          instructions: `Return to base. Distance: ${returnDistance.toFixed(2)} km, Estimated time: ${actualReturnTime.toFixed(0)} minutes`,
          distance: returnDistance,
          directionSteps: returnDirectionSteps,
          totalDuration: actualReturnTime,
        });
      } catch (error) {
        console.error(`Error creating return waypoint: ${error.message}`);
      }
    }

    return waypoints;
  }

  // Helper method to extract direction steps from the API response
  private extractDirectionSteps(directions: any): DirectionStep[] {
    if (!directions || !directions.segments || directions.segments.length === 0) {
      return [];
    }

    try {
      return directions.segments.flatMap(segment => {
        if (!segment.steps) return [];
        return segment.steps.map(step => ({
          distance: step.distance || 0,
          duration: step.duration || 0,
          instruction: step.instruction || '',
          name: step.name || '',
          type: step.type || ''
        }));
      });
    } catch (error) {
      console.error('Error extracting direction steps:', error.message);
      return [];
    }
  }

  // Existing estimate time method
  private estimateTime(distance: number): number {
    // Assuming average speed of 40 km/h for urban areas
    const averageSpeedKmh = 40;
    // Time in minutes
    return (distance / averageSpeedKmh) * 60;
  }
} 