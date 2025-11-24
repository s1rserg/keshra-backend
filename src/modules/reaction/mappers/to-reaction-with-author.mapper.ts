import { toUserMapper } from '@modules/user';

import { ReactionBase, ReactionWithAuthor } from '../types';
import { toReactionMapper } from './to-reaction.mapper';

export const toReactionWithAuthorMapper = (reactionLike: ReactionBase): ReactionWithAuthor => {
  if (!reactionLike.author) {
    throw new Error(`Reaction ${reactionLike.id} has no author.`);
  }

  return {
    ...toReactionMapper(reactionLike),
    author: toUserMapper(reactionLike.author),
  };
};
