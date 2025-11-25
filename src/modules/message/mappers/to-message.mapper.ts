import { toReactionWithAuthorMapper } from '@modules/reaction/mappers/to-reaction-with-author.mapper';

import type { Message, MessageBase } from '../types';

export const toMessageMapper = (messageLike: MessageBase): Message => {
  return {
    id: messageLike.id,
    content: messageLike.content,
    segNumber: messageLike.segNumber,
    reactions: (messageLike.reactions || []).map(toReactionWithAuthorMapper),
    chatId: messageLike.chatId,
    authorId: messageLike.authorId,
    updatedAt: messageLike.updatedAt,
    createdAt: messageLike.createdAt,
    deletedAt: messageLike.deletedAt,
  };
};
