import { ChatType } from '../enums/chat-type.enum';
import type { Chat, PrivateChat, PublicChat } from './contracts';

export const isPublicChat = (chat: Partial<Chat>): chat is PublicChat => {
  return chat.type === ChatType.PUBLIC;
};

export const isPrivateChat = (chat: Chat): chat is PrivateChat => {
  return chat.type === ChatType.DIRECT_MESSAGES;
};
