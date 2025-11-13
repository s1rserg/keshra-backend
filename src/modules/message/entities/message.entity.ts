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

import { ChatEntity } from '@modules/chat';
import { UserEntity } from '@modules/user';

@Index('idx_messages_author_id', ['authorId'])
@Index('idx_messages_chats_id_created_at_id', ['chatId', 'createdAt', 'id'])
@Entity({ name: 'messages', orderBy: { createdAt: 'ASC', id: 'ASC' } })
export class MessageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ name: 'author_id' })
  authorId: number;

  @Column({ name: 'chat_id' })
  chatId: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'author_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'messages_users_id_fk',
  })
  author: UserEntity;

  @ManyToOne(() => ChatEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'chat_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'messages_chats_id_fk',
  })
  chat: ChatEntity;
}
