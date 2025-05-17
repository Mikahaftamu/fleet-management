import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as throttle from 'express-throttle';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  // Add throttling middleware for rate limiting
  // Limit route optimization endpoints to prevent hitting external API rate limits
  app.use('/delivery/optimize', throttle({
    'burst': 10,    // Max 10 requests at once
    'rate': '30/min' // 30 requests per minute
  }));
  
  // Throttle directions API endpoint
  app.use('/delivery/directions', throttle({
    'burst': 5,     // Max 5 requests at once
    'rate': '30/min' // 30 requests per minute
  }));

  const config = new DocumentBuilder()
    .setTitle('Fleet Management API')
    .setDescription('API for managing fleet operations and deliveries')
    .setVersion('1.0')
    .addTag('Vehicle Management', 'Endpoints for managing vehicles')
    .addTag('Order Management', 'Endpoints for managing orders')
    .addTag('Route Optimization', 'Endpoints for route optimization')
    .addTag('Status Updates', 'Endpoints for updating statuses')
    .addTag('Analytics', 'Endpoints for analytics and reporting')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
