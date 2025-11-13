import { registerAs } from '@nestjs/config';

export const jwtConfiguration = registerAs('jwt-config', () => ({
  jwtSecret: process.env.JWT_SECRET!,
  accessTokenTtl: parseInt(process.env.ACCESS_TOKEN_TTL!),
  refreshTokenTtl: parseInt(process.env.REFRESH_TOKEN_TTL!),
}));
