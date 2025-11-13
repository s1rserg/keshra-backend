import type { ChatParticipantWithUser } from '@modules/chat-participant';

import type { Nullable } from '@common/types';

import { ChatType } from '../enums/chat-type.enum';

export interface ChatBase {
  // chat fields
  id: number;
  title: Nullable<string>;
  dmKey: Nullable<string>;
  type: ChatType;
  createdAt: Date;
  updatedAt: Date;

  // message denormalization
  lastMessageId: Nullable<number>;
  lastMessagePreview: Nullable<string>;
  lastMessageAuthor: Nullable<string>;
  lastMessageAuthorId: Nullable<number>;
}

type PublicChatOmit = Omit<ChatBase, 'dmKey'>;
export interface PublicChat extends PublicChatOmit {
  title: string;
  type: ChatType.PUBLIC;
}

export interface PrivateChat extends ChatBase {
  type: ChatType.DIRECT_MESSAGES;
  dmKey: string;
}

export type Chat = PublicChat | PrivateChat;
export type ChatWithParticipants = Chat & { participants: ChatParticipantWithUser[] };
