import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Nullable } from '@common/types';

import { MediaGcStatus } from '../types';
import { MediaEntity } from './media.entity';

@Entity('media_gc')
@Index('idx_media_gc_media_id_unique', ['mediaId'], { unique: true })
export class MediaGcEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'media_id' })
  mediaId: number;

  @Column({ name: 'public_id', type: 'varchar', length: 255 })
  publicId: string;

  @Column({ name: 'resource_type', type: 'varchar', length: 50 })
  resourceType: string;

  @Column({
    type: 'enum',
    enum: MediaGcStatus,
    default: MediaGcStatus.PENDING,
  })
  status: MediaGcStatus;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ name: 'last_attempt_at', type: 'timestamptz', nullable: true })
  lastAttemptAt: Nullable<Date>;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError: Nullable<string>;

  @OneToOne(() => MediaEntity)
  @JoinColumn({ name: 'media_id' })
  media: MediaEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
