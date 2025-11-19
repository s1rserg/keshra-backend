import type { ChatParticipantBase, PrivateChatIdTitleDto } from '../types';

type ParticipantLike = {
  id: number;
  chatId: ChatParticipantBase['chatId'];
  user: Pick<ChatParticipantBase['user'], 'id' | 'username'>;
};

export const toPrivateChatIdTitleMapper = (
  participantLike: ParticipantLike[],
): PrivateChatIdTitleDto => {
  return participantLike.reduce<PrivateChatIdTitleDto>((acc, participant) => {
    if (!participant.user.username) {
      throw new Error(`User ${participant.id} has no user.username.`);
    }

    if (!participant.chatId) {
      throw new Error(`Participant ${participant.id} has no chatId.`);
    }

    acc[participant.chatId] = {
      title: participant.user.username,
      userId: participant.user.id,
    };
    return acc;
  }, {});
};
