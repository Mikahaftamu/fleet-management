import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
