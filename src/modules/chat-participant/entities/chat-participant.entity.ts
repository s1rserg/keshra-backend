import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { ChatEntity } from '@modules/chat';
import { UserEntity } from '@modules/user';

import type { ChatParticipantBase } from '../types';

@Entity({ name: 'chat_participants' })
@Unique('uq_chat_participants_chat_user', ['chatId', 'userId'])
@Index('idx_chat_participants_user_id', ['userId'])
@Index('idx_chat_participants_chat_id', ['chatId'])
export class ChatParticipantEntity implements ChatParticipantBase {
  @PrimaryGeneratedColumn()
  id: number;

  // Foreign keys (explicit columns for fast joins)
  @Column({ name: 'chat_id', type: 'int' })
  chatId: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @CreateDateColumn({ name: 'joined_at', type: 'timestamptz' })
  joinedAt: Date;

  // Relations (no eager to avoid heavy joins)
  @ManyToOne(() => ChatEntity, (chat) => chat.id, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({
    name: 'chat_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_chat_participants_chat_id',
  })
  chat: ChatEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_chat_participants_user_id',
  })
  user: UserEntity;
}
