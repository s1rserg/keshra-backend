import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MediaEntity } from './entities/media.entity';
import { MediaGcEntity } from './entities/media-gc.entity';
import { UserMediaEntity } from './entities/user-media.entity';
import { CloudinaryService } from './services/cloudinary.service';
import { MediaGcOrphanFinderService } from './services/media-gc-orphan-finder.service';
import { MediaGcProcessorService } from './services/media-gc-processor.service';
import { MediaGcQueueManager } from './services/media-gc-queue-manager.service';
import { MediaGcRetryService } from './services/media-gc-retry.service';
import { UserAvatarService } from './services/user-avatar.service';
import { MediaRepository } from './repositories/media.repository';
import { MediaGcRepository } from './repositories/media-gc-repository';
import { UserMediaRepository } from './repositories/user-media.repository';

import { bullmqConfiguration, cloudinaryConfiguration, scheduleConfiguration } from './configs';
import { GC_MEDIA_QUEUE_NAME } from './constants';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([MediaEntity, UserMediaEntity, MediaGcEntity]),
    ConfigModule.forFeature(cloudinaryConfiguration),
    ConfigModule.forFeature(scheduleConfiguration),
    ConfigModule.forFeature(bullmqConfiguration),
    BullModule.registerQueueAsync({
      imports: [ConfigModule.forFeature(bullmqConfiguration)],
      name: GC_MEDIA_QUEUE_NAME,
      useFactory: (config: ConfigType<typeof bullmqConfiguration>) => ({
        redis: config.connection,
        defaultJobOptions: config.defaultJobOptions,
      }),
      inject: [bullmqConfiguration.KEY],
    }),
  ],
  providers: [
    MediaRepository,
    UserMediaRepository,
    MediaGcRepository,

    CloudinaryService,
    UserAvatarService,

    MediaGcProcessorService,
    MediaGcOrphanFinderService,
    MediaGcRetryService,
    MediaGcQueueManager,
  ],
  exports: [UserAvatarService],
})
export class MediaModule {}
