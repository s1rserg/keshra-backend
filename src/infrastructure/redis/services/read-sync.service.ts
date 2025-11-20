import { Injectable, Logger } from '@nestjs/common';
import { RedisManager } from '../redis.manager';

import { Nullable } from '@common/types';

import { PendingReadUpdate, ReadSyncBatch } from '../types';

import { REDIS_KEY_READ_UPDATES } from '../constants';

@Injectable()
export class ReadSyncService {
  private readonly logger = new Logger(ReadSyncService.name);

  constructor(private readonly redisManager: RedisManager) {}

  private get redis() {
    return this.redisManager.getClient();
  }

  async bufferReadStatus(userId: number, chatId: number, segNumber: number): Promise<void> {
    try {
      const field = `${userId}:${chatId}`;
      await this.redis.hSet(REDIS_KEY_READ_UPDATES, field, segNumber);
    } catch (error) {
      this.logger.error(`Failed to cache read status for user ${userId}`, error);
      throw error;
    }
  }

  async getPendingBatch(): Promise<Nullable<ReadSyncBatch>> {
    const exists = await this.redis.exists(REDIS_KEY_READ_UPDATES);
    if (!exists) return null;

    const batchKey = `${REDIS_KEY_READ_UPDATES}:batch:${Date.now()}`;

    await this.redis.rename(REDIS_KEY_READ_UPDATES, batchKey);

    const rawData = await this.redis.hGetAll(batchKey);

    const updates: PendingReadUpdate[] = Object.entries(rawData).map(([key, segStr]) => {
      const [userId, chatId] = key.split(':');
      return {
        userId: Number(userId),
        chatId: Number(chatId),
        segNumber: Number(segStr),
      };
    });

    return {
      batchId: batchKey,
      updates,
    };
  }

  async clearBatch(batchId: string): Promise<void> {
    await this.redis.del(batchId);
  }
}
