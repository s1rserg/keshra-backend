import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';

import { ReadSyncService } from '@infrastructure/redis';
import { ChatParticipantService } from '@modules/chat-participant';
import { MarkChatReadPayload } from '@modules/realtime';

import { readSyncScheduleConfiguration } from '../configs';
import { CronJob } from 'cron';

@Injectable()
export class ChatReadSyncService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ChatReadSyncService.name);

  constructor(
    private readonly chatParticipantService: ChatParticipantService,
    private readonly readSyncService: ReadSyncService,
    @Inject(readSyncScheduleConfiguration.KEY)
    private readonly config: ConfigType<typeof readSyncScheduleConfiguration>,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async addReadStatus(userId: number, payload: MarkChatReadPayload) {
    await this.readSyncService.bufferReadStatus(userId, payload.chatId, payload.segNumber);
  }

  onModuleInit() {
    const cronTime = this.config.syncSchedule;
    const job = new CronJob(cronTime, async () => this.syncReadStatuses());

    this.schedulerRegistry.addCronJob('chat-read-sync', job);
    job.start();
  }

  async syncReadStatuses() {
    try {
      const batch = await this.readSyncService.getPendingBatch();

      if (!batch || batch.updates.length === 0) {
        return;
      }

      this.logger.log(`Flushing ${batch.updates.length} read updates to DB...`);

      await this.chatParticipantService.updateLastRead(batch.updates);

      await this.readSyncService.clearBatch(batch.batchId);
    } catch (error) {
      this.logger.error('Error syncing read statuses.', error);
    }
  }

  onModuleDestroy() {
    this.schedulerRegistry.deleteCronJob('chat-read-sync');
  }
}
