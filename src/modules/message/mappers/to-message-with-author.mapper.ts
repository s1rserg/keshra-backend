import { toUserMapper } from '@modules/user';

import type { MessageBase, MessageWithAuthor } from '../types';

export const toMessageWithAuthorMapper = (messageLike: MessageBase): MessageWithAuthor => {
  if (!messageLike.author) {
    throw new Error(`Message ${messageLike.id} has no author.`);
  }

  return {
    author: toUserMapper(messageLike.author),
    id: messageLike.id,
    content: messageLike.content,
    segNumber: messageLike.segNumber,
    chatId: messageLike.chatId,
    authorId: messageLike.authorId,
    createdAt: messageLike.createdAt,
    updatedAt: messageLike.updatedAt,
  };
};
