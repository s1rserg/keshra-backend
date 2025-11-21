import { toUserMapper } from '@modules/user';

import type { Reaction } from '../types';

export const toReactionMapper = <T extends Reaction>(reactionLike: T): Reaction => {
  return {
    id: reactionLike.id,
    emoji: reactionLike.emoji,
    messageId: reactionLike.messageId,
    authorId: reactionLike.authorId,
    author: toUserMapper(reactionLike.author),
  };
};
