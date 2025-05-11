import { Injectable } from '@nestjs/common';
import { Vehicle } from '../entities/vehicle.entity';
import { Order } from '../entities/order.entity';
import { TestDataService } from './test-data.service';

@Injectable()
export class DatabaseService {
  constructor(private readonly testDataService: TestDataService) {}

  async getVehicleById(id: number): Promise<Vehicle | null> {
    const vehicles = await this.testDataService.getVehicles();
    return vehicles.find(v => v.id === id) || null;
  }

  async getAvailableVehicles(): Promise<Vehicle[]> {
    const vehicles = await this.testDataService.getVehicles();
    return vehicles.filter(v => v.status === 'available');
  }

  async getPendingOrders(): Promise<Order[]> {
    const orders = await this.testDataService.getOrders();
    return orders.filter(o => o.status === 'pending');
  }

  async updateVehicleLocation(
    vehicleId: number,
    latitude: number,
    longitude: number,
  ): Promise<Vehicle | null> {
    return this.testDataService.updateVehicleLocation(vehicleId, latitude, longitude);
  }

  async updateOrderStatus(
    orderId: number,
    status: string,
    vehicleId?: number,
  ): Promise<Order | null> {
    return this.testDataService.updateOrderStatus(orderId, status, vehicleId);
  }

  async getOrdersByVehicleId(vehicleId: number): Promise<Order[]> {
    const orders = await this.testDataService.getOrders();
    return orders.filter(o => o.assignedVehicleId === vehicleId);
  }
} 