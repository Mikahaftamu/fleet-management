import { Controller, Get, Post, Body, Param, Put, Delete, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { RouteOptimizerService } from '../services/route-optimizer.service';
import { TestDataService } from '../services/test-data.service';
import { DeliveryService } from '../services/delivery.service';
import { DirectionsService } from '../services/directions.service';
import { CreateVehicleDto, UpdateVehicleDto, VehicleResponseDto, LocationUpdateDto } from '../dto/vehicle.dto';
import { CreateOrderDto, UpdateOrderDto, OrderResponseDto, StatusUpdateDto } from '../dto/order.dto';
import { RouteResponseDto, AnalyticsResponseDto } from '../dto/route.dto';
import { AreaQueryDto } from '../dto/area.dto';
import { DirectionsQueryDto } from '../dto/directions.dto';
import { VehicleIdParam } from '../dto/vehicle-id.dto';

@Controller('delivery')
export class DeliveryController {
  constructor(
    private readonly routeOptimizerService: RouteOptimizerService,
    private readonly testDataService: TestDataService,
    private readonly deliveryService: DeliveryService,
    private readonly directionsService: DirectionsService,
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
  @ApiParam({
    name: 'vehicleId',
    description: 'ID of the vehicle',
    type: Number,
    required: true,
    example: 1
  })
  @ApiResponse({ status: 200, description: 'Returns the optimized route with waypoints', type: RouteResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid vehicle ID' })
  async getOptimizedRoute(@Param('vehicleId', ParseIntPipe) vehicleId: number) {
    try {
      if (isNaN(vehicleId) || vehicleId <= 0) {
        throw new BadRequestException(`Invalid vehicle ID: ${vehicleId}. Vehicle ID must be a positive number.`);
      }
      
      const route = await this.deliveryService.getOptimizedRoute(vehicleId);
      return {
        success: true,
        data: route
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      return {
        success: false,
        message: error.message || 'An error occurred while optimizing the route',
        vehicleId: vehicleId
      };
    }
  }

  @ApiTags('Route Optimization')
  @Get('optimize-multi')
  @ApiOperation({ summary: 'Get optimized routes for all available vehicles' })
  @ApiResponse({ status: 200, description: 'Returns optimized routes for all vehicles', type: Object })
  async getOptimizedMultiVehicleRoutes() {
    const routes = await this.deliveryService.getOptimizedMultiVehicleRoutes();
    // Convert Map to plain object for API serialization
    const result = {};
    routes.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  @ApiTags('Route Optimization')
  @Get('area-optimize')
  @ApiOperation({ summary: 'Get optimized routes for a specific area' })
  @ApiResponse({ status: 200, description: 'Returns optimized routes for the specified area', type: Object })
  @ApiResponse({ status: 400, description: 'Invalid area coordinates' })
  async getOptimizedRoutesForArea(@Query() query: AreaQueryDto) {
    try {
      // Validate that north > south and east > west
      if (query.north <= query.south) {
        throw new BadRequestException('North coordinate must be greater than south coordinate');
      }
      if (query.east <= query.west) {
        throw new BadRequestException('East coordinate must be greater than west coordinate');
      }
      
      const routes = await this.deliveryService.getOptimizedRoutesForArea(
        query.north,
        query.south,
        query.east,
        query.west
      );
      
      // Convert Map to plain object for API serialization
      const result = {};
      routes.forEach((value, key) => {
        result[key] = value;
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      return {
        success: false,
        message: error.message || 'An error occurred while optimizing routes',
        details: {
          coordinates: {
            north: query.north,
            south: query.south,
            east: query.east,
            west: query.west
          }
        }
      };
    }
  }

  @ApiTags('Route Optimization')
  @Get('directions')
  @ApiOperation({ summary: 'Get turn-by-turn directions between two points' })
  @ApiResponse({ status: 200, description: 'Returns turn-by-turn directions', type: Object })
  async getDirections(@Query() query: DirectionsQueryDto) {
    try {
      const result = await this.directionsService.getDirections(
        query.startLat,
        query.startLng,
        query.endLat,
        query.endLng
      );
      
      if (!result) {
        return {
          success: false,
          message: 'Unable to get directions. Please check if API key is configured correctly.'
        };
      }
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: `Error fetching directions: ${error.message}`
      };
    }
  }

  // =========================================
  // 4. Status Update Endpoints
  // =========================================
  @ApiTags('Status Updates')
  @Put('status/:orderId')
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({
    name: 'orderId',
    description: 'ID of the order',
    type: Number,
    required: true,
    example: 1
  })
  @ApiResponse({ status: 200, description: 'Order status updated successfully', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid order ID' })
  async updateOrderStatus(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() statusUpdate: StatusUpdateDto
  ) {
    try {
      if (isNaN(orderId) || orderId <= 0) {
        throw new BadRequestException(`Invalid order ID: ${orderId}. Order ID must be a positive number.`);
      }
      
      return this.deliveryService.updateOrderStatus(orderId, statusUpdate.status, statusUpdate.vehicleId);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      return {
        success: false,
        message: error.message || 'An error occurred while updating order status',
        orderId: orderId
      };
    }
  }

  @ApiTags('Status Updates')
  @Put('vehicle/:vehicleId/location')
  @ApiOperation({ summary: 'Update vehicle location' })
  @ApiParam({
    name: 'vehicleId',
    description: 'ID of the vehicle',
    type: Number,
    required: true,
    example: 1
  })
  @ApiResponse({ status: 200, description: 'Vehicle location updated successfully', type: VehicleResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid vehicle ID' })
  async updateVehicleLocation(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Body() location: LocationUpdateDto
  ) {
    try {
      if (isNaN(vehicleId) || vehicleId <= 0) {
        throw new BadRequestException(`Invalid vehicle ID: ${vehicleId}. Vehicle ID must be a positive number.`);
      }
      
      return this.deliveryService.updateVehicleLocation(
        vehicleId,
        location.latitude,
        location.longitude
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      return {
        success: false,
        message: error.message || 'An error occurred while updating vehicle location',
        vehicleId: vehicleId
      };
    }
  }

  @ApiTags('Status Updates')
  @Get('vehicle/:vehicleId/current-location')
  @ApiOperation({ summary: 'Get current vehicle location' })
  @ApiParam({
    name: 'vehicleId',
    description: 'ID of the vehicle',
    type: Number,
    required: true,
    example: 1
  })
  @ApiResponse({ status: 200, description: 'Returns the current vehicle location', type: VehicleResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid vehicle ID' })
  async getVehicleLocation(@Param('vehicleId', ParseIntPipe) vehicleId: number) {
    try {
      if (isNaN(vehicleId) || vehicleId <= 0) {
        throw new BadRequestException(`Invalid vehicle ID: ${vehicleId}. Vehicle ID must be a positive number.`);
      }
      
      return this.deliveryService.getVehicleLocation(vehicleId);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      return {
        success: false,
        message: error.message || 'An error occurred while retrieving vehicle location',
        vehicleId: vehicleId
      };
    }
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