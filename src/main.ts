import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
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

  const allowedOrigins = ['http://localhost:5173', 'https://s1rserg.github.io'];

  const corsOptions: CorsOptions = {
    credentials: true,
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy blocked origin: ${origin}`), false);
      }
    },
  };

  app.enableCors(corsOptions);

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

  await app.listen(+process.env.APP_PORT!, '0.0.0.0');
}

void bootstrap();
