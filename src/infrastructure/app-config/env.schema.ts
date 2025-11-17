import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  APP_ENV: Joi.string().valid('dev', 'prod'),

  // ! APP
  APP_PORT: Joi.number().required(),

  // ! POSTGRES
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),

  // ! JWT
  JWT_SECRET: Joi.string().required(),
  ACCESS_TOKEN_TTL: Joi.number().required(),
  REFRESH_TOKEN_TTL: Joi.number().required(),

  // ! WS
  WS_CORS_ORIGIN: Joi.string().required(),
  WS_TRANSPORTS: Joi.string().required(),
  WS_MAX_PAYLOAD: Joi.number().required(),
  WS_PING_INTERVAL: Joi.number().required(),
  WS_PING_TIMEOUT: Joi.number().required(),

  // ! CLOUDINARY
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),

  // ! GC
  MEDIA_GC_SCHEDULE: Joi.string().required(),
  MEDIA_GC_RETRY_SCHEDULE: Joi.string().required(),

  // ! Redis
  REDIS_DURABLE_HOST_PORT: Joi.number().required(),
  REDIS_DURABLE_USER: Joi.string().required(),
  REDIS_DURABLE_PASSWORD: Joi.string().required(),
  REDIS_DURABLE_HOST: Joi.string().required(),
});
