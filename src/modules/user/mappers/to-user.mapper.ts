import type { User } from '../types';

export const toUserMapper = <T extends User>(userLike: T): User => ({
  id: userLike.id,
  email: userLike.email,
  name: userLike.name,
  surname: userLike.surname,
  username: userLike.username,
  createdAt: userLike.createdAt,
  updatedAt: userLike.updatedAt,
});
