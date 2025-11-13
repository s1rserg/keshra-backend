import { registerAs } from '@nestjs/config';

export const wsConfiguration = registerAs('ws-config', () => ({
  wsCorsOrigin: process.env.WS_CORS_ORIGIN,
  wsTransports: process.env.WS_TRANSPORTS,
  wsMaxPayload: +process.env.WS_MAX_PAYLOAD!,
  wsPingInterval: +process.env.WS_PING_INTERVAL!,
  wsPingTimeout: +process.env.WS_PING_TIMEOUT!,
}));
