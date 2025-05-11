import { Injectable } from '@nestjs/common';
import { Vehicle } from '../entities/vehicle.entity';
import { Order } from '../entities/order.entity';

@Injectable()
export class TestDataService {
  // Mekelle coordinates: 13.4966° N, 39.4753° E
  private vehicles: Vehicle[] = [
    {
      id: 1,
      type: 'Truck',
      status: 'available',
      currentLatitude: 13.4966,
      currentLongitude: 39.4753,
      maxWeight: 5000,
      currentWeight: 0,
      currentOrderId: 0,
    },
    {
      id: 2,
      type: 'Van',
      status: 'available',
      currentLatitude: 13.4966,
      currentLongitude: 39.4753,
      maxWeight: 2000,
      currentWeight: 0,
      currentOrderId: 0,
    },{
      id: 3,
      type: 'Pickup',
      status: 'available',
      currentLatitude: 13.4966,
      currentLongitude: 39.4753,
      maxWeight: 1000,
      currentWeight: 0,
      currentOrderId: 0,
    },
    {
      id: 4,
      type: 'Pickup',
      status: 'busy',
      currentLatitude: 13.4966,
      currentLongitude: 39.4753,
      maxWeight: 1000,
      currentWeight: 0,
      currentOrderId: 0,
    },
  ];

  private orders: Order[] = [
    {
      id: 1,
      status: 'pending',
      pickupLatitude: 13.4966,
      pickupLongitude: 39.4753,
      deliveryLatitude: 13.4966,
      deliveryLongitude: 39.4753,
      weight: 500,
      assignedVehicleId: 0,
      customerId: 1,
      vendorId: 1,
      createdAt: new Date(),
      completedAt: null,
    },
    {
      id: 2,
      status: 'pending',
      pickupLatitude: 13.4966,
      pickupLongitude: 39.4753,
      deliveryLatitude: 13.4966,
      deliveryLongitude: 39.4753,
      weight: 1000,
      assignedVehicleId: 0,
      customerId: 2,
      vendorId: 1,
      createdAt: new Date(),
      completedAt: null,
    },
  ];

  // Vehicle Management Methods
  async getVehicles(): Promise<Vehicle[]> {
    return this.vehicles;
  }

  async getVehicleById(id: number): Promise<Vehicle | null> {
    return this.vehicles.find(v => v.id === id) || null;
  }

  async addVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const newVehicle: Vehicle = {
      id: this.vehicles.length + 1,
      type: vehicle.type || 'Truck',
      status: vehicle.status || 'available',
      currentLatitude: vehicle.currentLatitude || 13.4966,
      currentLongitude: vehicle.currentLongitude || 39.4753,
      maxWeight: vehicle.maxWeight || 5000,
      currentWeight: 0,
      currentOrderId: 0,
    };
    this.vehicles.push(newVehicle);
    return newVehicle;
  }

  async updateVehicle(id: number, vehicle: Partial<Vehicle>): Promise<Vehicle | null> {
    const index = this.vehicles.findIndex(v => v.id === id);
    if (index === -1) return null;

    this.vehicles[index] = {
      ...this.vehicles[index],
      ...vehicle,
    };
    return this.vehicles[index];
  }

  async removeVehicle(id: number): Promise<boolean> {
    const index = this.vehicles.findIndex(v => v.id === id);
    if (index === -1) return false;

    this.vehicles.splice(index, 1);
    return true;
  }

  // Order Management Methods
  async getOrders(): Promise<Order[]> {
    return this.orders;
  }

  async getOrderById(id: number): Promise<Order | null> {
    return this.orders.find(o => o.id === id) || null;
  }

  async createOrder(order: Partial<Order>): Promise<Order> {
    const newOrder: Order = {
      id: this.orders.length + 1,
      status: 'pending',
      pickupLatitude: order.pickupLatitude || 13.4966,
      pickupLongitude: order.pickupLongitude || 39.4753,
      deliveryLatitude: order.deliveryLatitude || 13.4966,
      deliveryLongitude: order.deliveryLongitude || 39.4753,
      weight: order.weight || 500,
      assignedVehicleId: 0,
      customerId: order.customerId || 1,
      vendorId: order.vendorId || 1,
      createdAt: new Date(),
      completedAt: null,
    };
    this.orders.push(newOrder);
    return newOrder;
  }

  async updateOrder(id: number, order: Partial<Order>): Promise<Order | null> {
    const index = this.orders.findIndex(o => o.id === id);
    if (index === -1) return null;

    this.orders[index] = {
      ...this.orders[index],
      ...order,
    };
    return this.orders[index];
  }

  // Existing Methods
  async getAvailableVehicles(): Promise<Vehicle[]> {
    return this.vehicles.filter(v => v.status === 'available');
  }

  async getPendingOrders(): Promise<Order[]> {
    return this.orders.filter(o => o.status === 'pending');
  }

  async updateVehicleLocation(
    vehicleId: number,
    latitude: number,
    longitude: number,
  ): Promise<Vehicle | null> {
    const vehicle = await this.getVehicleById(vehicleId);
    if (!vehicle) return null;

    vehicle.currentLatitude = latitude;
    vehicle.currentLongitude = longitude;
    return vehicle;
  }

  async updateOrderStatus(
    orderId: number,
    status: string,
    vehicleId?: number,
  ): Promise<Order | null> {
    const order = await this.getOrderById(orderId);
    if (!order) return null;

    order.status = status;
    if (vehicleId) {
      order.assignedVehicleId = vehicleId;
    }
    if (status === 'completed') {
      order.completedAt = new Date();
    }
    return order;
  }

  getOrdersByVehicleId(vehicleId: number): Order[] {
    return this.orders.filter(order => order.assignedVehicleId === vehicleId);
  }
} 