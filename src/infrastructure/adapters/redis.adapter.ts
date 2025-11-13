import { IoAdapter } from '@nestjs/platform-socket.io';
import { createClient } from 'redis';
import type { Server, ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const password = process.env.REDIS_DURABLE_PASSWORD;
    const user = process.env.REDIS_DURABLE_USER;
    const host = process.env.REDIS_DURABLE_HOST;
    const port = +process.env.REDIS_DURABLE_HOST_PORT!;

    const pubClient = createClient({
      url: `redis://${user}:${password}@${host}:${port}/0`,
      username: user,
      password: password,
    });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  override createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options) as Server;
    server.adapter(this.adapterConstructor);
    return server;
  }
}
