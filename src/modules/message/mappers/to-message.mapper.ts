import { toReactionMapper } from '@modules/reaction';

import type { Message, MessageBase } from '../types';

export const toMessageMapper = (messageLike: MessageBase): Message => {
  return {
    id: messageLike.id,
    content: messageLike.content,
    segNumber: messageLike.segNumber,
    reactions: messageLike.reactions.map(toReactionMapper),
    chatId: messageLike.chatId,
    authorId: messageLike.authorId,
    updatedAt: messageLike.updatedAt,
    createdAt: messageLike.createdAt,
  };
};
