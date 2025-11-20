import type { ChatBase } from '@modules/chat';
import type { User } from '@modules/user';

import { Nullable } from '@common/types';

export interface UpdateLastRead {
  segNumber: number;
  chatId: number;
  userId: number;
}

export interface ChatParticipantBase {
  id: number;
  lastReadSegNumber: Nullable<number>;
  chatId: number;
  userId: number;
  joinedAt: Date;

  // joins
  chat: ChatBase;
  user: User;
}

export type ChatParticipant = Omit<ChatParticipantBase, 'chat' | 'user'>;

export type PrivateChatIdTitleDto = Record<number, { title: string; userId: number }>;

export interface ChatParticipantWithUser
  extends Pick<ChatParticipantBase, 'id' | 'joinedAt' | 'user'> {}
