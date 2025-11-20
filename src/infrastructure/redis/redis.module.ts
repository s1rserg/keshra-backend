import { Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

import { redisConfig } from './redis.config';

@Global()
@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [redisConfig.KEY],
      useFactory: async (config: ConfigType<typeof redisConfig>) => {
        const client = createClient({
          url: config.url,
        });

        await client.connect();
        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule implements OnModuleDestroy {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType) {}

  async onModuleDestroy() {
    if (this.redisClient.isOpen) {
      await this.redisClient.disconnect();
    }
  }
}
