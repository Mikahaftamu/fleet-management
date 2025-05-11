import { Injectable } from '@nestjs/common';
import { DistanceUtil } from '../utils/distance.util';
import { Order } from '../entities/order.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { Waypoint } from '../types/waypoint.type';

@Injectable()
export class RouteOptimizerService {
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

  generateWaypoints(route: Order[]): Waypoint[] {
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
      // Calculate distance to pickup
      const pickupDistance = DistanceUtil.calculateDistance(
        currentLocation.lat,
        currentLocation.lon,
        order.pickupLatitude,
        order.pickupLongitude,
      );
      const pickupTime = this.estimateTime(pickupDistance);
      
      // Add pickup waypoint
      waypoints.push({
        type: 'pickup',
        latitude: order.pickupLatitude,
        longitude: order.pickupLongitude,
        orderId: order.id,
        estimatedTime: pickupTime,
        step: stepNumber++,
        instructions: `Drive to pickup location for Order #${order.id}. Distance: ${pickupDistance.toFixed(2)} km, Estimated time: ${pickupTime.toFixed(0)} minutes`,
        distance: pickupDistance,
      });

      // Calculate distance to delivery
      const deliveryDistance = DistanceUtil.calculateDistance(
        order.pickupLatitude,
        order.pickupLongitude,
        order.deliveryLatitude,
        order.deliveryLongitude,
      );
      const deliveryTime = this.estimateTime(deliveryDistance);

      // Add delivery waypoint
      waypoints.push({
        type: 'delivery',
        latitude: order.deliveryLatitude,
        longitude: order.deliveryLongitude,
        orderId: order.id,
        estimatedTime: deliveryTime,
        step: stepNumber++,
        instructions: `Deliver Order #${order.id} to customer. Distance: ${deliveryDistance.toFixed(2)} km, Estimated time: ${deliveryTime.toFixed(0)} minutes`,
        distance: deliveryDistance,
      });

      currentLocation = {
        lat: order.deliveryLatitude,
        lon: order.deliveryLongitude,
      };
    }

    // Add return to base instruction if needed
    if (route.length > 0) {
      const returnDistance = DistanceUtil.calculateDistance(
        currentLocation.lat,
        currentLocation.lon,
        route[0].pickupLatitude,
        route[0].pickupLongitude,
      );
      const returnTime = this.estimateTime(returnDistance);

      waypoints.push({
        type: 'delivery',
        latitude: route[0].pickupLatitude,
        longitude: route[0].pickupLongitude,
        orderId: 0,
        estimatedTime: returnTime,
        step: stepNumber,
        instructions: `Return to base. Distance: ${returnDistance.toFixed(2)} km, Estimated time: ${returnTime.toFixed(0)} minutes`,
        distance: returnDistance,
      });
    }

    return waypoints;
  }

  private estimateTime(distance: number): number {
    // Assuming average speed of 50 km/h
    const averageSpeed = 50;
    return (distance / averageSpeed) * 60; // Time in minutes
  }
} 