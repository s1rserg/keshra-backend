import type { Message, MessageBase } from '../types';

export const toMessageMapper = (messageLike: MessageBase): Message => {
  return {
    id: messageLike.id,
    content: messageLike.content,
    chatId: messageLike.chatId,
    authorId: messageLike.authorId,
    updatedAt: messageLike.updatedAt,
    createdAt: messageLike.createdAt,
  };
};
