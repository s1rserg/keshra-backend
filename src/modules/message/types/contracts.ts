import type { ChatBase } from '@modules/chat';
import { ReactionWithAuthor } from '@modules/reaction';
import type { User } from '@modules/user';

import type { Nullable } from '@common/types';

export interface MessageBase {
  id: number;
  content: string;
  chatId: number;
  authorId: number;
  segNumber: number;
  reactions: ReactionWithAuthor[];
  chat: Nullable<ChatBase>;
  author: Nullable<User>;
  createdAt: Date;
  updatedAt: Date;
}

type MessageOmit = Omit<MessageBase, 'author' | 'chat'>;
export interface Message extends MessageOmit {}

type MessageWithAuthorOmit = Omit<MessageBase, 'chat'>;
export interface MessageWithAuthor extends MessageWithAuthorOmit {
  author: User;
}
