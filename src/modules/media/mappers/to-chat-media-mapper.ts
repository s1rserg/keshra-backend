import type { ChatMedia } from '../types';
import { toMediaMapper } from './to-media-mapper';

export const toChatMediaMapper = <T extends ChatMedia>(chatMediaLike: T): ChatMedia => ({
  id: chatMediaLike.id,
  role: chatMediaLike.role,
  isMain: chatMediaLike.isMain,
  chatId: chatMediaLike.chatId,
  mediaId: chatMediaLike.mediaId,
  media: chatMediaLike.media && toMediaMapper(chatMediaLike.media),
  createdAt: chatMediaLike.createdAt,
  updatedAt: chatMediaLike.updatedAt,
});
