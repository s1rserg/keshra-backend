import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

import { getSwaggerDocument } from '@app/config/swagger.config';
import { RedisIoAdapter } from '@infrastructure/adapters/redis.adapter';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  app.use(cookieParser());

  app.enableCors({ credentials: true, origin: 'http://localhost:5173' });

  // URL modifier
  app.setGlobalPrefix('api');

  // Validations
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      forbidNonWhitelisted: true,
      transform: false,
      transformOptions: { exposeUnsetFields: false },
    }),
  );

  // Swagger
  const swaggerDocument = getSwaggerDocument(app);
  SwaggerModule.setup('swagger', app, swaggerDocument);

  await app.listen(+process.env.APP_PORT!);
}

void bootstrap();
