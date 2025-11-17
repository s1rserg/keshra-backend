import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';

import type { GcMediaJobData } from '../types';
import { MediaGcStatus } from '../types';
import { MediaGcRepository } from '../repositories/media-gc-repository';

import { scheduleConfiguration } from '../configs';
import { GC_MEDIA_QUEUE_NAME, MAX_GC_ATTEMPTS } from '../constants';
import { Queue } from 'bullmq';
import { CronJob } from 'cron';

@Injectable()
export class MediaGcRetryService implements OnModuleInit {
  constructor(
    private readonly mediaGcRepository: MediaGcRepository,
    @InjectQueue(GC_MEDIA_QUEUE_NAME)
    private readonly gcMediaQueue: Queue<GcMediaJobData>,
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject(scheduleConfiguration.KEY)
    private config: ConfigType<typeof scheduleConfiguration>,
  ) {}

  onModuleInit() {
    const schedule = this.config.mediaGcRetrySchedule;
    const job = new CronJob(schedule, async () => {
      await this.requeueFailedJobs();
    });

    this.schedulerRegistry.addCronJob('retry-failed-gc-jobs', job);

    job.start();
  }

  async requeueFailedJobs() {
    const jobsToRetry = await this.mediaGcRepository.findRetryableFailedJobs(MAX_GC_ATTEMPTS);

    if (jobsToRetry.length === 0) {
      return;
    }

    for (const job of jobsToRetry) {
      job.status = MediaGcStatus.PENDING;
      await this.mediaGcRepository.save(job);

      await this.gcMediaQueue.add(
        'process-orphan',
        { gcMediaId: job.id },
        {
          jobId: `gc-media-${job.id}`,
        },
      );
    }
  }
}
