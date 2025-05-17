import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { DeliveryController } from './controllers/delivery.controller';
import { DeliveryService } from './services/delivery.service';
import { TestDataService } from './services/test-data.service';
import { RouteOptimizerService } from './services/route-optimizer.service';
import { DirectionsService } from './services/directions.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
  ],
  controllers: [DeliveryController],
  providers: [
    DeliveryService,
    TestDataService,
    RouteOptimizerService,
    DirectionsService,
  ],
})
export class AppModule {}
