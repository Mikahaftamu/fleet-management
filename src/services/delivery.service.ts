import { Injectable } from '@nestjs/common';
import { TestDataService } from './test-data.service';
import { RouteOptimizerService } from './route-optimizer.service';
import { Waypoint } from '../types/waypoint.type';
import { Vehicle } from '../entities/vehicle.entity';
import { Order } from '../entities/order.entity';

@Injectable()
export class DeliveryService {
  constructor(
    private readonly testDataService: TestDataService,
    private readonly routeOptimizerService: RouteOptimizerService,
  ) {}

  // Vehicle Management Methods
  async getVehicles(status?: string): Promise<Vehicle[]> {
    const vehicles = await this.testDataService.getVehicles();
    return status ? vehicles.filter(v => v.status === status) : vehicles;
  }

  async getVehicleById(id: number): Promise<Vehicle | null> {
    return this.testDataService.getVehicleById(id);
  }

  async addVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle> {
    return this.testDataService.addVehicle(vehicle);
  }

  async updateVehicle(id: number, vehicle: Partial<Vehicle>): Promise<Vehicle | null> {
    return this.testDataService.updateVehicle(id, vehicle);
  }

  async removeVehicle(id: number): Promise<boolean> {
    return this.testDataService.removeVehicle(id);
  }

  // Order Management Methods
  async getOrders(status?: string, vehicleId?: number): Promise<Order[]> {
    const orders = await this.testDataService.getOrders();
    return orders.filter(order => {
      if (status && order.status !== status) return false;
      if (vehicleId && order.assignedVehicleId !== vehicleId) return false;
      return true;
    });
  }

  async getOrderById(id: number): Promise<Order | null> {
    const orders = await this.testDataService.getOrders();
    return orders.find(order => order.id === id) || null;
  }

  async createOrder(order: Partial<Order>): Promise<Order> {
    return this.testDataService.createOrder(order);
  }

  async updateOrder(id: number, order: Partial<Order>): Promise<Order | null> {
    return this.testDataService.updateOrder(id, order);
  }

  async cancelOrder(id: number): Promise<Order | null> {
    return this.testDataService.updateOrderStatus(id, 'cancelled');
  }

  // Route Optimization Methods
  async getOptimizedRoute(vehicleId: number): Promise<{
    vehicle: any;
    waypoints: Waypoint[];
  }> {
    const vehicle = await this.testDataService.getVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    const orders = await this.testDataService.getPendingOrders();
    const optimizedRoute = this.routeOptimizerService.optimizeRoute(vehicle, orders);
    const waypoints = this.routeOptimizerService.generateWaypoints(optimizedRoute);

    return {
      vehicle,
      waypoints,
    };
  }

  async getOptimizedMultiVehicleRoutes(): Promise<Map<number, {
    vehicle: any;
    waypoints: Waypoint[];
  }>> {
    const vehicles = await this.testDataService.getAvailableVehicles();
    const orders = await this.testDataService.getPendingOrders();
    
    const vehicleRoutes = this.routeOptimizerService.optimizeMultiVehicleRoutes(
      vehicles,
      orders,
    );

    const result = new Map();
    for (const [vehicleId, route] of vehicleRoutes.entries()) {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      const waypoints = this.routeOptimizerService.generateWaypoints(route);
      result.set(vehicleId, {
        vehicle,
        waypoints,
      });
    }

    return result;
  }

  async getOptimizedRoutesForArea(
    north: number,
    south: number,
    east: number,
    west: number,
  ): Promise<Map<number, {
    vehicle: any;
    waypoints: Waypoint[];
  }>> {
    // Validate coordinates
    if (north <= south) {
      throw new Error('North coordinate must be greater than south coordinate');
    }
    if (east <= west) {
      throw new Error('East coordinate must be greater than west coordinate');
    }

    const vehicles = await this.testDataService.getAvailableVehicles();
    if (vehicles.length === 0) {
      throw new Error('No available vehicles found');
    }

    const orders = await this.testDataService.getPendingOrders();
    if (orders.length === 0) {
      throw new Error('No pending orders found');
    }
    
    // Filter orders within the specified area
    const areaOrders = orders.filter(order => 
      order.pickupLatitude <= north &&
      order.pickupLatitude >= south &&
      order.pickupLongitude <= east &&
      order.pickupLongitude >= west
    );

    if (areaOrders.length === 0) {
      throw new Error('No orders found in the specified area');
    }

    const vehicleRoutes = this.routeOptimizerService.optimizeMultiVehicleRoutes(
      vehicles,
      areaOrders,
    );

    if (vehicleRoutes.size === 0) {
      throw new Error('No routes could be generated for the available vehicles');
    }

    const result = new Map();
    for (const [vehicleId, route] of vehicleRoutes.entries()) {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (vehicle) {
        const waypoints = this.routeOptimizerService.generateWaypoints(route);
        result.set(vehicleId, {
          vehicle,
          waypoints,
        });
      }
    }

    if (result.size === 0) {
      throw new Error('No valid routes could be generated');
    }

    return result;
  }

  // Status Update Methods
  async updateOrderStatus(
    orderId: number,
    status: string,
    vehicleId?: number,
  ): Promise<any> {
    const updatedOrder = await this.testDataService.updateOrderStatus(
      orderId,
      status,
      vehicleId,
    );
    if (!updatedOrder) {
      throw new Error('Order not found');
    }
    return { message: 'Status updated successfully', order: updatedOrder };
  }

  async updateVehicleLocation(
    vehicleId: number,
    latitude: number,
    longitude: number,
  ): Promise<any> {
    const updatedVehicle = await this.testDataService.updateVehicleLocation(
      vehicleId,
      latitude,
      longitude,
    );
    if (!updatedVehicle) {
      throw new Error('Vehicle not found');
    }
    return { message: 'Location updated successfully', vehicle: updatedVehicle };
  }

  async getVehicleLocation(vehicleId: number): Promise<any> {
    const vehicle = await this.testDataService.getVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    return {
      latitude: vehicle.currentLatitude,
      longitude: vehicle.currentLongitude,
    };
  }

  // Analytics Methods
  async getVehicleAnalytics(period: string = 'day'): Promise<any> {
    const vehicles = await this.testDataService.getVehicles();
    const orders = await this.testDataService.getOrders();

    // Calculate basic analytics
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.status === 'available').length;
    const busyVehicles = vehicles.filter(v => v.status === 'busy').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;

    // Calculate order statistics
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const inProgressOrders = orders.filter(o => o.status === 'in_progress').length;

    return {
      period,
      vehicles: {
        total: totalVehicles,
        available: availableVehicles,
        busy: busyVehicles,
        maintenance: maintenanceVehicles,
        utilization: (busyVehicles / totalVehicles) * 100,
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
        pending: pendingOrders,
        inProgress: inProgressOrders,
        completionRate: (completedOrders / totalOrders) * 100,
      },
    };
  }

  async getOrderAnalytics(period: string = 'day'): Promise<any> {
    const orders = await this.testDataService.getOrders();

    // Calculate order statistics
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const inProgressOrders = orders.filter(o => o.status === 'in_progress').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

    // Calculate average delivery time (if available in the data)
    const completedOrderTimes = orders
      .filter(o => o.status === 'completed' && o.completedAt)
      .map(o => new Date(o.completedAt).getTime() - new Date(o.createdAt).getTime());

    const averageDeliveryTime = completedOrderTimes.length > 0
      ? completedOrderTimes.reduce((a, b) => a + b, 0) / completedOrderTimes.length
      : 0;

    return {
      period,
      total: totalOrders,
      completed: completedOrders,
      pending: pendingOrders,
      inProgress: inProgressOrders,
      cancelled: cancelledOrders,
      completionRate: (completedOrders / totalOrders) * 100,
      averageDeliveryTime: averageDeliveryTime / (1000 * 60), // Convert to minutes
    };
  }
} 