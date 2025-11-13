import type { ChatBase } from '@modules/chat';
import type { User } from '@modules/user';

export interface ChatParticipantBase {
  id: number;
  chatId: number;
  userId: number;
  joinedAt: Date;

  // joins
  chat: ChatBase;
  user: User;
}

export type ChatParticipant = Omit<ChatParticipantBase, 'chat' | 'user'>;

export type PrivateChatTitleDto = Record<number, string>;

export interface ChatParticipantWithUser
  extends Pick<ChatParticipantBase, 'id' | 'joinedAt' | 'user'> {}
