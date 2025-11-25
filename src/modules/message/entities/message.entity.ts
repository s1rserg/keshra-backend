import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ChatEntity } from '@modules/chat';
import { ReactionEntity } from '@modules/reaction/entities/reaction.entity'; // NOTE: cannot use barrel
import { UserEntity } from '@modules/user';

import { Nullable } from '@common/types';

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

  @Column({ name: 'reply_to_id', nullable: true })
  replyToId: Nullable<number>;

  @Column({ name: 'seg_number', type: 'int' })
  segNumber: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Nullable<Date>;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'author_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'messages_users_id_fk',
  })
  author: UserEntity;

  @ManyToOne(() => MessageEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reply_to_id' })
  replyToMessage: Nullable<MessageEntity>;

  @ManyToOne(() => ChatEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'chat_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'messages_chats_id_fk',
  })
  chat: ChatEntity;

  @OneToMany(() => ReactionEntity, (reaction) => reaction.message)
  reactions: ReactionEntity[];
}
