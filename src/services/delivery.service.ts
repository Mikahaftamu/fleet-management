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
    console.log(`Getting optimized route for vehicle ID: ${vehicleId}`);
    
    // Check if vehicle ID is valid
    if (!vehicleId || isNaN(vehicleId)) {
      throw new Error(`Invalid vehicle ID: ${vehicleId}`);
    }
    
    // Get all vehicles to see what's available
    const allVehicles = await this.testDataService.getVehicles();
    console.log(`Total vehicles in system: ${allVehicles.length}`);
    console.log(`Available vehicle IDs: ${allVehicles.map(v => v.id).join(', ')}`);
    
    const vehicle = await this.testDataService.getVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error(`Vehicle not found with ID: ${vehicleId}. Available IDs: ${allVehicles.map(v => v.id).join(', ')}`);
    }
    
    console.log(`Found vehicle: ID=${vehicle.id}, Type=${vehicle.type}, Status=${vehicle.status}`);
    
    const orders = await this.testDataService.getPendingOrders();
    console.log(`Found ${orders.length} pending orders to optimize`);
    
    const optimizedRoute = this.routeOptimizerService.optimizeRoute(vehicle, orders);
    console.log(`Optimized route has ${optimizedRoute.length} stops`);
    
    const waypoints = await this.routeOptimizerService.generateWaypoints(optimizedRoute);
    console.log(`Generated ${waypoints.length} waypoints for the route`);

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
      const waypoints = await this.routeOptimizerService.generateWaypoints(route);
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
    console.log(`Optimizing routes for area: North=${north}, South=${south}, East=${east}, West=${west}`);
    
    // Validate coordinates
    if (north <= south) {
      throw new Error('North coordinate must be greater than south coordinate');
    }
    if (east <= west) {
      throw new Error('East coordinate must be greater than west coordinate');
    }

    // Get all vehicles first to see what's available
    const allVehicles = await this.testDataService.getVehicles();
    console.log(`Total vehicles in system: ${allVehicles.length}`);
    console.log(`Vehicle statuses: ${allVehicles.map(v => `ID:${v.id}=${v.status}`).join(', ')}`);
    
    const vehicles = await this.testDataService.getAvailableVehicles();
    console.log(`Available vehicles: ${vehicles.length}`);
    
    if (vehicles.length === 0) {
      throw new Error('No available vehicles found. Please ensure vehicles are marked as "available" status.');
    }

    const orders = await this.testDataService.getPendingOrders();
    console.log(`Total pending orders: ${orders.length}`);
    
    if (orders.length === 0) {
      throw new Error('No pending orders found. Please create orders with "pending" status.');
    }
    
    // Filter orders within the specified area
    const areaOrders = orders.filter(order => 
      order.pickupLatitude <= north &&
      order.pickupLatitude >= south &&
      order.pickupLongitude <= east &&
      order.pickupLongitude >= west
    );
    console.log(`Orders in specified area: ${areaOrders.length}`);

    if (areaOrders.length === 0) {
      throw new Error(`No orders found in the specified area. Please adjust coordinates: North=${north}, South=${south}, East=${east}, West=${west}`);
    }

    // Log all order locations for debugging
    console.log('Order locations:');
    orders.forEach(order => {
      console.log(`Order ${order.id}: (${order.pickupLatitude}, ${order.pickupLongitude}) -> (${order.deliveryLatitude}, ${order.deliveryLongitude})`);
    });

    const vehicleRoutes = this.routeOptimizerService.optimizeMultiVehicleRoutes(
      vehicles,
      areaOrders,
    );
    console.log(`Generated routes for ${vehicleRoutes.size} vehicles`);

    if (vehicleRoutes.size === 0) {
      throw new Error('No routes could be generated for the available vehicles. This may be due to vehicle capacity or other constraints.');
    }

    // Rest of the method remains the same
    const result = new Map();
    for (const [vehicleId, route] of vehicleRoutes.entries()) {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (vehicle) {
        const waypoints = await this.routeOptimizerService.generateWaypoints(route);
        result.set(vehicleId, {
          vehicle,
          waypoints,
        });
      }
    }

    if (result.size === 0) {
      throw new Error('No valid routes could be generated. This may indicate a problem with the routing algorithm.');
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