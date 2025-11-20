import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { RedisClientType } from 'redis';

import { ChatParticipantService } from '@modules/chat-participant';
import { MarkChatReadPayload } from '@modules/realtime';

import { readSyncScheduleConfiguration } from '../configs';
import { REDIS_KEY_READ_UPDATES } from '../constants';
import { CronJob } from 'cron';

@Injectable()
export class ChatReadSyncService {
  private readonly logger = new Logger(ChatReadSyncService.name);

  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
    private readonly chatParticipantService: ChatParticipantService,
    @Inject(readSyncScheduleConfiguration.KEY)
    private readonly config: ConfigType<typeof readSyncScheduleConfiguration>,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async addReadStatus(userId: number, payload: MarkChatReadPayload) {
    try {
      const field = `${userId}:${payload.chatId}`;
      await this.redisClient.hSet(REDIS_KEY_READ_UPDATES, field, payload.segNumber);
    } catch (e) {
      this.logger.error(`Failed to cache read status for user ${userId}`, e);
    }
  }

  onModuleInit() {
    const cronTime = this.config.syncSchedule;

    const job = new CronJob(cronTime, async () => this.syncReadStatuses());
    this.schedulerRegistry.addCronJob('chat-read-sync', job);

    job.start();
  }

  async syncReadStatuses() {
    const exists = await this.redisClient.exists(REDIS_KEY_READ_UPDATES);
    if (!exists) return;

    const batchKey = `${REDIS_KEY_READ_UPDATES}:batch:${Date.now()}`;

    try {
      await this.redisClient.rename(REDIS_KEY_READ_UPDATES, batchKey);

      const allUpdates = await this.redisClient.hGetAll(batchKey);

      const updatesToProcess = Object.entries(allUpdates).map(([key, segStr]) => {
        const [userId, chatId] = key.split(':');
        return {
          userId: Number(userId),
          chatId: Number(chatId),
          segNumber: Number(segStr),
        };
      });

      if (updatesToProcess.length > 0) {
        this.logger.log(`Flushing ${updatesToProcess.length} read updates to DB...`);

        await this.chatParticipantService.updateLastRead(updatesToProcess);
      }

      await this.redisClient.del(batchKey);
    } catch (error) {
      this.logger.error('Error syncing read statuses.', error);
    }
  }

  onModuleDestroy() {
    this.schedulerRegistry.deleteCronJob('chat-read-sync');
  }
}
