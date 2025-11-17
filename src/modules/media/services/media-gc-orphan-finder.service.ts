import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { DataSource } from 'typeorm';

import { GcMediaJobData } from '../types';
import { MediaGcRepository } from '../repositories/media-gc-repository';

import { scheduleConfiguration } from '../configs';
import { GC_MEDIA_QUEUE_NAME } from '../constants';
import { Queue } from 'bullmq';
import { CronJob } from 'cron';

@Injectable()
export class MediaGcOrphanFinderService implements OnModuleInit {
  constructor(
    @Inject(DataSource) private readonly dataSource: DataSource,
    private readonly mediaGcRepository: MediaGcRepository,
    @InjectQueue(GC_MEDIA_QUEUE_NAME)
    private readonly gcMediaQueue: Queue<GcMediaJobData>,
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject(scheduleConfiguration.KEY)
    private config: ConfigType<typeof scheduleConfiguration>,
  ) {}

  onModuleInit() {
    const schedule = this.config.mediaGcSchedule;
    const job = new CronJob(schedule, async () => {
      await this.findAndEnqueueOrphans();
    });

    this.schedulerRegistry.addCronJob('find-media-orphans', job);
    job.start();
  }

  async findAndEnqueueOrphans() {
    const newOrphans = await this.dataSource.transaction(async (manager) => {
      return this.mediaGcRepository.stageOrphans(manager);
    });

    if (newOrphans.length === 0) {
      return;
    }

    const jobs = newOrphans.map((orphan) => ({
      name: 'process-orphan',
      data: { gcMediaId: orphan.id },
      opts: {
        jobId: `gc-media-${orphan.id}`,
      },
    }));

    await this.gcMediaQueue.addBulk(jobs);
  }
}
