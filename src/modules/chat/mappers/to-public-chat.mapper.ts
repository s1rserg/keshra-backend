import type { ChatBase, PublicChat } from '../types';
import { ChatType } from '../enums/chat-type.enum';

export const toPublicChatMapper = (entity: ChatBase): PublicChat => {
  if (entity.type !== ChatType.PUBLIC) {
    throw new Error(
      `Expected chat ${entity.id} to be of type ${ChatType.PUBLIC}, but got ${entity.type}. `,
    );
  }

  if (entity.title === null) {
    throw new Error(`Chat ${entity.id} has no title. Expected title to be non-null.`);
  }

  return {
    id: entity.id,
    title: entity.title,
    type: entity.type,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,

    // message denormalization
    lastMessageId: entity.lastMessageId,
    lastMessagePreview: entity.lastMessagePreview,
    lastMessageAuthor: entity.lastMessageAuthor,
    lastMessageAuthorId: entity.lastMessageAuthorId,
    lastSegNumber: entity.lastSegNumber,
  };
};
