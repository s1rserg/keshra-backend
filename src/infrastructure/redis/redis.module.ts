import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { RedisManager } from './redis.manager';
import { createClient } from 'redis';

import { redisConfig } from './redis.config';
import { PresenceService } from './services/presence.service';
import { ReadSyncService } from './services/read-sync.service';

@Global()
@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [redisConfig.KEY],
      useFactory: (config: ConfigType<typeof redisConfig>) => {
        return createClient({
          url: config.url,
        });
      },
    },
    RedisManager,
    ReadSyncService,
    PresenceService,
  ],
  exports: [RedisManager, ReadSyncService, PresenceService],
})
export class RedisModule {}
