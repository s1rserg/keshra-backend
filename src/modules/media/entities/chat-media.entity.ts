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

import { ChatEntity } from '@modules/chat/entities/chat.entity'; // NOTE: cannot use barrel file

import { ChatMediaRole } from '../types';
import { MediaEntity } from './media.entity';

@Entity('chat_media')
@Index(
  'idx_one_main_avatar_per_chat',
  (chatMedia: ChatMediaEntity) => [chatMedia.chatId, chatMedia.role],
  {
    unique: true,
    where: `"is_main" = true`,
  },
)
export class ChatMediaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ChatMediaRole })
  role: ChatMediaRole;

  @Column({ type: 'boolean', name: 'is_main', default: false })
  isMain: boolean;

  @Column({ name: 'chat_id' })
  chatId: number;

  @Column({ name: 'media_id' })
  mediaId: number;

  @ManyToOne(() => ChatEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat: ChatEntity;

  @ManyToOne(() => MediaEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'media_id' })
  media: MediaEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
