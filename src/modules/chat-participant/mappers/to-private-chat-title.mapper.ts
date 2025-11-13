import type { ChatParticipantBase, PrivateChatTitleDto } from '../types';

type ParticipantLike = {
  id: number;
  chatId: ChatParticipantBase['chatId'];
  user: Pick<ChatParticipantBase['user'], 'id' | 'username'>;
};

export const toPrivateChatTitleMapper = (
  participantLike: ParticipantLike[],
): PrivateChatTitleDto => {
  return participantLike.reduce<PrivateChatTitleDto>((acc, participant) => {
    if (!participant.user.username) {
      throw new Error(`User ${participant.id} has no user.username.`);
    }

    if (!participant.chatId) {
      throw new Error(`Participant ${participant.id} has no chatId.`);
    }

    acc[participant.chatId] = participant.user.username;
    return acc;
  }, {});
};
