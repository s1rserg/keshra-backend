import type { Media } from '../types';

export const toMediaMapper = <T extends Media>(mediaLike: T): Media => ({
  id: mediaLike.id,
  width: mediaLike.width,
  height: mediaLike.height,
  secureUrl: mediaLike.secureUrl,
  createdAt: mediaLike.createdAt,
});
