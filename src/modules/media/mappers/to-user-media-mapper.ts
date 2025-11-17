import type { UserMedia } from '../types';
import { toMediaMapper } from './to-media-mapper';

export const toUserMediaMapper = <T extends UserMedia>(userMediaLike: T): UserMedia => ({
  id: userMediaLike.id,
  role: userMediaLike.role,
  isMain: userMediaLike.isMain,
  userId: userMediaLike.userId,
  mediaId: userMediaLike.mediaId,
  media: userMediaLike.media && toMediaMapper(userMediaLike.media),
  createdAt: userMediaLike.createdAt,
  updatedAt: userMediaLike.updatedAt,
});
