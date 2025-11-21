import type { User } from '@modules/user';

export interface Reaction {
  id: number;
  emoji: string;
  authorId: number;
  messageId: number;
  author: User;
}
