import type { User } from '@modules/user';

import { Nullable } from '@common/types';

export interface ReactionBase {
  id: number;
  emoji: string;
  authorId: number;
  messageId: number;
  author: Nullable<User>;
}

type ReactionOmit = Omit<ReactionBase, 'author'>;
export interface Reaction extends ReactionOmit {}

export interface ReactionWithAuthor extends ReactionBase {
  author: User;
}
