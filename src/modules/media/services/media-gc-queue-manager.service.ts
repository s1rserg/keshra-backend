import { Process, Processor } from '@nestjs/bull';

import { GcMediaJobData } from '../types';
import { MediaGcProcessorService } from './media-gc-processor.service';

import { GC_MEDIA_QUEUE_NAME } from '../constants';
import { Job } from 'bullmq';

@Processor(GC_MEDIA_QUEUE_NAME)
export class MediaGcQueueManager {
  constructor(private readonly processorService: MediaGcProcessorService) {}

  @Process('process-orphan')
  async handleProcessOrphan(job: Job<GcMediaJobData>) {
    await this.processorService.processOrphan(job.data.gcMediaId);
  }
}
