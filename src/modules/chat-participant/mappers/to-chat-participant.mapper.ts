import type { ChatParticipant, ChatParticipantBase } from '../types';

export const toChatParticipantMapper = (participantLike: ChatParticipantBase): ChatParticipant => {
  return {
    id: participantLike.id,
    chatId: participantLike.chatId,
    userId: participantLike.userId,
    joinedAt: participantLike.joinedAt,
  };
};
