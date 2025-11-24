import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { MessageEntity } from '@modules/message';
import { UserEntity } from '@modules/user';

@Unique(['authorId', 'messageId'])
@Entity({ name: 'reactions' })
export class ReactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  emoji: string;

  @Column({ name: 'author_id' })
  authorId: number;

  @Column({ name: 'message_id' })
  messageId: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: UserEntity;

  @ManyToOne(() => MessageEntity, (message) => message.reactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  message: MessageEntity;
}
