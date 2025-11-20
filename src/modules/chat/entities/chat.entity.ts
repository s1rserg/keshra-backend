import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import type { Nullable } from '@common/types';

import type { ChatBase } from '../types';
import { ChatType } from '../enums/chat-type.enum';

@Entity({ name: 'chats', orderBy: { id: 'ASC' } })
@Index('idx_chats_type', ['type'])
@Unique('uq_chats_dm_key', ['dmKey'])
export class ChatEntity implements ChatBase {
  // chat fields
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  title: Nullable<string>;

  @Column({ type: 'varchar', length: 50, nullable: true })
  dmKey: Nullable<string>;

  @Column({ type: 'enum', enum: ChatType })
  type: ChatType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // message denormalization
  @Column({ name: 'last_message_id', type: 'int', nullable: true })
  lastMessageId: Nullable<number>;

  @Column({ name: 'last_message_preview', type: 'text', nullable: true })
  lastMessagePreview: Nullable<string>;

  @Column({ name: 'last_message_author', type: 'varchar', length: 50, nullable: true })
  lastMessageAuthor: Nullable<string>;

  @Column({ name: 'last_message_author_id', type: 'int', nullable: true })
  lastMessageAuthorId: Nullable<number>;

  @Column({ name: 'last_seg_number', type: 'int', default: 0 })
  lastSegNumber: number;
}
