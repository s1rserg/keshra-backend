import type { ChatBase, PrivateChat } from '../types';
import { ChatType } from '../enums/chat-type.enum';

export const toPrivateChatMapper = (entity: ChatBase): PrivateChat => {
  if (entity.type !== ChatType.DIRECT_MESSAGES) {
    throw new Error(
      `Expected chat ${entity.id} to be of type ${ChatType.DIRECT_MESSAGES}, but got ${entity.type}. `,
    );
  }

  if (!entity.dmKey) {
    throw new Error(`Chat ${entity.id} has no dmKey.`);
  }

  return {
    id: entity.id,
    title: entity.title,
    type: entity.type,
    dmKey: entity.dmKey,
    updatedAt: entity.updatedAt,
    createdAt: entity.createdAt,

    // message denormalization
    lastMessageId: entity.lastMessageId,
    lastMessagePreview: entity.lastMessagePreview,
    lastMessageAuthor: entity.lastMessageAuthor,
    lastMessageAuthorId: entity.lastMessageAuthorId,
    lastSegNumber: entity.lastSegNumber,
  };
};
