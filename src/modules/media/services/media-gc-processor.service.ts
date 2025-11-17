import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { MediaGcStatus } from '../types';
import { CloudinaryService } from './cloudinary.service';
import { MediaRepository } from '../repositories/media.repository';
import { MediaGcRepository } from '../repositories/media-gc-repository';

import { MAX_GC_ATTEMPTS } from '../constants';

@Injectable()
export class MediaGcProcessorService {
  private readonly dataSource: DataSource;
  private readonly mediaRepository: MediaRepository;
  private readonly cloudinaryService: CloudinaryService;
  private readonly mediaGcRepository: MediaGcRepository;

  constructor(
    @Inject(DataSource) dataSource: DataSource,
    mediaRepository: MediaRepository,
    cloudinaryService: CloudinaryService,
    mediaGcRepository: MediaGcRepository,
  ) {
    this.dataSource = dataSource;
    this.mediaRepository = mediaRepository;
    this.cloudinaryService = cloudinaryService;
    this.mediaGcRepository = mediaGcRepository;
  }

  async processOrphan(gcMediaId: number): Promise<void> {
    const success = await this.dataSource.transaction(async (manager) => {
      const gcEntry = await this.mediaGcRepository.findByIdAndLock(gcMediaId, manager);
      if (!gcEntry || gcEntry.status === MediaGcStatus.FAILED) return true;

      gcEntry.status = MediaGcStatus.PROCESSING;
      gcEntry.attempts += 1;
      gcEntry.lastAttemptAt = new Date();
      await this.mediaGcRepository.save(gcEntry, manager);

      try {
        await this.cloudinaryService.delete(gcEntry.publicId, gcEntry.resourceType);

        await this.mediaGcRepository.delete(gcEntry.id, manager);

        await this.mediaRepository.delete(gcEntry.mediaId, manager);

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        gcEntry.lastError = errorMessage.substring(0, 1000);

        if (gcEntry.attempts >= MAX_GC_ATTEMPTS) {
          gcEntry.status = MediaGcStatus.FAILED;
        } else {
          gcEntry.status = MediaGcStatus.PENDING;
        }
        await this.mediaGcRepository.save(gcEntry, manager);
        return false;
      }
    });
    if (!success) {
      throw new Error(`GC Job ${gcMediaId} failed.`);
    }
  }
}
