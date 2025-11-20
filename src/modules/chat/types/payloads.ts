import type { Nullable } from '@common/types';

import type { ChatType } from '../enums/chat-type.enum';

export interface CreateChatPayload {
  title: Nullable<string>;
  type: ChatType;
}

export interface CreatePublicChatPayload extends CreateChatPayload {
  type: ChatType.PUBLIC;
}

export interface CreatePrivateChatPayload extends CreateChatPayload {
  type: ChatType.DIRECT_MESSAGES;
  dmKey: string;
}

export type UpdateLastMessagePayload = {
  chatId: number;
  lastMessageId: number;
  lastMessageAuthorId: number;
  lastMessageAuthor: string;
  lastMessagePreview: string;
  lastSegNumber: number;
};
