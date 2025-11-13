import { toUserMapper } from '@modules/user';

import type { ChatParticipantWithUser } from '../types';

export const toChatParticipantWithUser = (
  participantLike: ChatParticipantWithUser,
): ChatParticipantWithUser => {
  if (!participantLike.id) {
    throw new Error(`Participant has no id.`);
  }

  if (!participantLike.user) {
    throw new Error(`Participant ${participantLike.id} has no user.`);
  }

  if (!participantLike.joinedAt) {
    throw new Error(`Participant ${participantLike.id} has no joinedAt.`);
  }

  return {
    id: participantLike.id,
    joinedAt: participantLike.joinedAt,
    user: toUserMapper(participantLike.user),
  };
};
