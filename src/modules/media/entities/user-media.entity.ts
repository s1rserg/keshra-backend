import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserEntity } from '@modules/user';

import { UserMediaRole } from '../types';
import { MediaEntity } from './media.entity';

@Entity('user_media')
@Index(
  'idx_one_main_avatar_per_user',
  (userMedia: UserMediaEntity) => [userMedia.userId, userMedia.role],
  {
    unique: true,
    where: `"is_main" = true`,
  },
)
export class UserMediaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: UserMediaRole })
  role: UserMediaRole;

  @Column({ type: 'boolean', name: 'is_main', default: false })
  isMain: boolean;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'media_id' })
  mediaId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => MediaEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'media_id' })
  media: MediaEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
