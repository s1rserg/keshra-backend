import type { Reaction, ReactionBase } from '../types';

export const toReactionMapper = (reactionLike: ReactionBase): Reaction => {
  return {
    id: reactionLike.id,
    emoji: reactionLike.emoji,
    messageId: reactionLike.messageId,
    authorId: reactionLike.authorId,
  };
};
