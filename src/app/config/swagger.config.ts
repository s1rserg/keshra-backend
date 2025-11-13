import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Server')
  .setDescription('Server API description')
  .setVersion('1.0')
  .build();

export const getSwaggerDocument = (app: INestApplication) => {
  return SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: true,
  });
};
