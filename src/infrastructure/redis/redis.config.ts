import { registerAs } from '@nestjs/config';

export const redisConfig = registerAs('redis-config', () => {
  const user = process.env.REDIS_DURABLE_USER;
  const password = process.env.REDIS_DURABLE_PASSWORD;
  const host = process.env.REDIS_DURABLE_HOST;
  const port = process.env.REDIS_DURABLE_HOST_PORT;

  return {
    user,
    password,
    host,
    port: +port!,
    url: `redis://${user}:${password}@${host}:${port}/0`,
  };
});
