import { ClientToServerEvent } from './events-enums';

export interface MarkChatReadPayload {
  chatId: number;
  segNumber: number;
}

export interface ClientToServerEvents {
  [ClientToServerEvent.CHAT_JOIN]: (chatId: number) => void;
  [ClientToServerEvent.CHAT_LEAVE]: (chatId: number) => void;
  [ClientToServerEvent.CHAT_DELTA_JOIN]: (chatIds: number[]) => void;
  [ClientToServerEvent.CHAT_DELTA_LEAVE]: (chatIds?: number[]) => void;
  [ClientToServerEvent.CHAT_MARK_READ]: (payload: MarkChatReadPayload) => void;
}
