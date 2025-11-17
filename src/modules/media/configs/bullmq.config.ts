import { registerAs } from '@nestjs/config';

export const bullmqConfiguration = registerAs('bullmq-config', () => ({
  connection: {
    host: process.env.REDIS_DURABLE_HOST,
    port: +process.env.REDIS_DURABLE_HOST_PORT!,
    username: process.env.REDIS_DURABLE_USER,
    password: process.env.REDIS_DURABLE_PASSWORD,
    db: 0,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
    removeOnFail: true,
  },
}));
