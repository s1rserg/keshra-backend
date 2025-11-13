import { Injectable } from '@nestjs/common';

import type { MessageWithAuthor } from '@modules/message';

import { type ChatDeltaNewDto, ServerToClientEvent, type TypedServer } from '../types';

@Injectable()
export class RealtimeChatEventsService {
  private server: TypedServer;

  setServer(server: TypedServer) {
    this.server = server;
  }

  emitNewMessage(message: MessageWithAuthor) {
    this.server.to(`chat:${message.chatId}`).emit(ServerToClientEvent.CHAT_MESSAGE_NEW, message);
  }

  emitNewChatDelta(payload: ChatDeltaNewDto) {
    this.server
      .to(`chat:delta:${payload.chatId}`)
      .emit(ServerToClientEvent.CHAT_DELTA_NEW, payload);
  }
}
