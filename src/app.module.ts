import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DeliveryController } from './controllers/delivery.controller';
import { DeliveryService } from './services/delivery.service';
import { TestDataService } from './services/test-data.service';
import { RouteOptimizerService } from './services/route-optimizer.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [DeliveryController],
  providers: [
    DeliveryService,
    TestDataService,
    RouteOptimizerService,
  ],
})
export class AppModule {}
