import type { MessageWithAuthor } from '@modules/message';
import { ReactionWithAuthor } from '@modules/reaction';

import type { ErrorResponse } from '@common/types';

import { ServerToClientEvent } from './events-enums';

export interface ChatDeltaNewPayload {
  chatId: number;
  lastMessageAuthor: string;
  lastMessagePreview: string;
}
export interface ChatDeltaNewDto extends ChatDeltaNewPayload {}

export interface MeJoinedChatPayload {
  chatId: number;
}

export interface ReactionDeletedPayload {
  authorId: number;
  messageId: number;
}

export interface ServerToClientEvents {
  [ServerToClientEvent.APP_ERROR]: (error: ErrorResponse) => void;
  [ServerToClientEvent.CHAT_ERROR]: (error: ErrorResponse) => void;
  [ServerToClientEvent.ME_JOINED_CHAT]: (payload: MeJoinedChatPayload) => void;
  [ServerToClientEvent.ME_LEFT_CHAT]: (chatId: number) => void;
  [ServerToClientEvent.CHAT_MESSAGE_NEW]: (message: MessageWithAuthor) => void;
  [ServerToClientEvent.CHAT_REACTION_NEW]: (reaction: ReactionWithAuthor) => void;
  [ServerToClientEvent.CHAT_REACTION_DELETE]: (payload: ReactionDeletedPayload) => void;
  [ServerToClientEvent.CHAT_DELTA_NEW]: (payload: ChatDeltaNewPayload) => void;
  [ServerToClientEvent.CHAT_PRESENCE_USER_ONLINE]: (userId: number) => void;
  [ServerToClientEvent.CHAT_PRESENCE_USER_OFFLINE]: (userId: number) => void;
}
