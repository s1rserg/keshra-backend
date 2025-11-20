import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisManager implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType) {}

  getClient(): RedisClientType {
    return this.redisClient;
  }

  async onModuleInit() {
    if (!this.redisClient.isOpen) {
      await this.redisClient.connect();
    }
  }

  async onModuleDestroy() {
    if (this.redisClient.isOpen) {
      await this.redisClient.quit();
    }
  }
}
