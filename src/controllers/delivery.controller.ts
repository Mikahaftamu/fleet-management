import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RouteOptimizerService } from '../services/route-optimizer.service';
import { TestDataService } from '../services/test-data.service';
import { DeliveryService } from '../services/delivery.service';
import { CreateVehicleDto, UpdateVehicleDto, VehicleResponseDto } from '../dto/vehicle.dto';
import { CreateOrderDto, UpdateOrderDto, OrderResponseDto } from '../dto/order.dto';
import { RouteResponseDto, AnalyticsResponseDto } from '../dto/route.dto';

@Controller('delivery')
export class DeliveryController {
  constructor(
    private readonly routeOptimizerService: RouteOptimizerService,
    private readonly testDataService: TestDataService,
    private readonly deliveryService: DeliveryService,
  ) {}

  // =========================================
  // 1. Vehicle Management Endpoints
  // =========================================
  @ApiTags('Vehicle Management')
  @Get('vehicles')
  @ApiOperation({ summary: 'Get all vehicles' })
  @ApiQuery({ name: 'status', required: false, enum: ['available', 'busy', 'maintenance'] })
  @ApiResponse({ status: 200, description: 'Returns list of vehicles', type: [VehicleResponseDto] })
  async getVehicles(@Query('status') status?: string) {
    return this.deliveryService.getVehicles(status);
  }

  @ApiTags('Vehicle Management')
  @Get('vehicles/:id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiResponse({ status: 200, description: 'Returns vehicle details', type: VehicleResponseDto })
  async getVehicle(@Param('id') id: string) {
    return this.deliveryService.getVehicleById(Number(id));
  }

  @ApiTags('Vehicle Management')
  @Post('vehicles')
  @ApiOperation({ summary: 'Add new vehicle' })
  @ApiResponse({ status: 201, description: 'Vehicle created successfully', type: VehicleResponseDto })
  async addVehicle(@Body() vehicle: CreateVehicleDto) {
    return this.deliveryService.addVehicle(vehicle);
  }

  @ApiTags('Vehicle Management')
  @Put('vehicles/:id')
  @ApiOperation({ summary: 'Update vehicle details' })
  @ApiResponse({ status: 200, description: 'Vehicle updated successfully', type: VehicleResponseDto })
  async updateVehicle(
    @Param('id') id: string,
    @Body() vehicle: UpdateVehicleDto
  ) {
    return this.deliveryService.updateVehicle(Number(id), vehicle);
  }

  @ApiTags('Vehicle Management')
  @Delete('vehicles/:id')
  @ApiOperation({ summary: 'Remove vehicle' })
  @ApiResponse({ status: 200, description: 'Vehicle removed successfully' })
  async removeVehicle(@Param('id') id: string) {
    return this.deliveryService.removeVehicle(Number(id));
  }

  // =========================================
  // 2. Order Management Endpoints
  // =========================================
  @ApiTags('Order Management')
  @Get('orders')
  @ApiOperation({ summary: 'Get all orders' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'in_progress', 'completed', 'cancelled'] })
  @ApiQuery({ name: 'vehicleId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns list of orders', type: [OrderResponseDto] })
  async getOrders(
    @Query('status') status?: string,
    @Query('vehicleId') vehicleId?: string,
  ) {
    return this.deliveryService.getOrders(status, vehicleId ? Number(vehicleId) : undefined);
  }

  @ApiTags('Order Management')
  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Returns order details', type: OrderResponseDto })
  async getOrder(@Param('id') id: string) {
    return this.deliveryService.getOrderById(Number(id));
  }

  @ApiTags('Order Management')
  @Post('orders')
  @ApiOperation({ summary: 'Create new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully', type: OrderResponseDto })
  async createOrder(@Body() order: CreateOrderDto) {
    return this.deliveryService.createOrder(order);
  }

  @ApiTags('Order Management')
  @Put('orders/:id')
  @ApiOperation({ summary: 'Update order details' })
  @ApiResponse({ status: 200, description: 'Order updated successfully', type: OrderResponseDto })
  async updateOrder(
    @Param('id') id: string,
    @Body() order: UpdateOrderDto
  ) {
    return this.deliveryService.updateOrder(Number(id), order);
  }

  @ApiTags('Order Management')
  @Delete('orders/:id')
  @ApiOperation({ summary: 'Cancel order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully', type: OrderResponseDto })
  async cancelOrder(@Param('id') id: number) {
    return this.deliveryService.cancelOrder(id);
  }

  // =========================================
  // 3. Route Optimization Endpoints
  // =========================================
  @ApiTags('Route Optimization')
  @Get('optimize/:vehicleId')
  @ApiOperation({ summary: 'Get optimized route for a vehicle' })
  @ApiResponse({ status: 200, description: 'Returns the optimized route with waypoints', type: RouteResponseDto })
  async getOptimizedRoute(@Param('vehicleId') vehicleId: number) {
    return this.deliveryService.getOptimizedRoute(vehicleId);
  }

  @ApiTags('Route Optimization')
  @Get('optimize-multi')
  @ApiOperation({ summary: 'Get optimized routes for all available vehicles' })
  @ApiResponse({ status: 200, description: 'Returns optimized routes for all vehicles', type: Map })
  async getOptimizedMultiVehicleRoutes() {
    return this.deliveryService.getOptimizedMultiVehicleRoutes();
  }

  @ApiTags('Route Optimization')
  @Get('optimize/area')
  @ApiOperation({ summary: 'Get optimized routes for a specific area' })
  @ApiQuery({ name: 'north', required: true, type: Number })
  @ApiQuery({ name: 'south', required: true, type: Number })
  @ApiQuery({ name: 'east', required: true, type: Number })
  @ApiQuery({ name: 'west', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Returns optimized routes for the specified area', type: Map })
  async getOptimizedRoutesForArea(
    @Query('north') north: number,
    @Query('south') south: number,
    @Query('east') east: number,
    @Query('west') west: number,
  ) {
    return this.deliveryService.getOptimizedRoutesForArea(north, south, east, west);
  }

  // =========================================
  // 4. Status Update Endpoints
  // =========================================
  @ApiTags('Status Updates')
  @Put('status/:orderId')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully', type: OrderResponseDto })
  async updateOrderStatus(
    @Param('orderId') orderId: number,
    @Body('status') status: string,
    @Body('vehicleId') vehicleId?: number,
  ) {
    return this.deliveryService.updateOrderStatus(orderId, status, vehicleId);
  }

  @ApiTags('Status Updates')
  @Put('vehicle/:vehicleId/location')
  @ApiOperation({ summary: 'Update vehicle location' })
  @ApiResponse({ status: 200, description: 'Vehicle location updated successfully', type: VehicleResponseDto })
  async updateVehicleLocation(
    @Param('vehicleId') vehicleId: number,
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
  ) {
    return this.deliveryService.updateVehicleLocation(vehicleId, latitude, longitude);
  }

  @ApiTags('Status Updates')
  @Get('vehicle/:vehicleId/current-location')
  @ApiOperation({ summary: 'Get current vehicle location' })
  @ApiResponse({ status: 200, description: 'Returns the current vehicle location', type: VehicleResponseDto })
  async getVehicleLocation(@Param('vehicleId') vehicleId: number) {
    return this.deliveryService.getVehicleLocation(vehicleId);
  }

  // =========================================
  // 5. Analytics Endpoints
  // =========================================
  @ApiTags('Analytics')
  @Get('analytics/vehicles')
  @ApiOperation({ summary: 'Get vehicle analytics' })
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month'] })
  @ApiResponse({ status: 200, description: 'Returns vehicle analytics', type: AnalyticsResponseDto })
  async getVehicleAnalytics(@Query('period') period: string = 'day') {
    return this.deliveryService.getVehicleAnalytics(period);
  }

  @ApiTags('Analytics')
  @Get('analytics/orders')
  @ApiOperation({ summary: 'Get order analytics' })
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month'] })
  @ApiResponse({ status: 200, description: 'Returns order analytics', type: AnalyticsResponseDto })
  async getOrderAnalytics(@Query('period') period: string = 'day') {
    return this.deliveryService.getOrderAnalytics(period);
  }
} 