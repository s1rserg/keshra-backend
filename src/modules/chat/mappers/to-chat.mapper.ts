import { exhaustiveChek } from '@common/utils/exhaustive-check';

import type { Chat, ChatBase } from '../types';
import { ChatType } from '../enums/chat-type.enum';
import type { ChatEntity } from '../entities/chat.entity';
import { toPrivateChatMapper } from './to-private-chat.mapper';
import { toPublicChatMapper } from './to-public-chat.mapper';

export const toChatMapper = (entity: ChatBase): Chat => {
  const mapper = (item: ChatEntity): Chat => {
    switch (item.type) {
      case ChatType.PUBLIC:
        return toPublicChatMapper(item);
      case ChatType.DIRECT_MESSAGES:
        return toPrivateChatMapper(item);
      default:
        return exhaustiveChek(item.type);
    }
  };

  return mapper(entity);
};
