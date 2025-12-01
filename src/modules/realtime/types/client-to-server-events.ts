import { Nullable } from '@common/types';

import { ClientToServerEvent } from './events-enums';

export interface MarkChatReadPayload {
  chatId: number;
  segNumber: number;
}

export interface CallSignalPayload {
  partnerId: number;
  signal: Nullable<RTCSessionDescriptionInit | RTCIceCandidateInit>;
}

export interface ClientToServerEvents {
  [ClientToServerEvent.CHAT_JOIN]: (chatId: number) => void;
  [ClientToServerEvent.CHAT_LEAVE]: (chatId: number) => void;
  [ClientToServerEvent.CHAT_DELTA_JOIN]: (chatIds: number[]) => void;
  [ClientToServerEvent.CHAT_DELTA_LEAVE]: (chatIds?: number[]) => void;
  [ClientToServerEvent.CHAT_MARK_READ]: (payload: MarkChatReadPayload) => void;

  [ClientToServerEvent.CALL_OFFER]: (payload: CallSignalPayload) => void;
  [ClientToServerEvent.CALL_ANSWER]: (payload: CallSignalPayload) => void;
  [ClientToServerEvent.CALL_ICE_CANDIDATE]: (payload: CallSignalPayload) => void;
  [ClientToServerEvent.CALL_HANGUP]: (chatId: number) => void;
}
