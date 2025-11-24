import { Injectable } from '@nestjs/common';

import type { MessageWithAuthor } from '@modules/message';
import { ReactionWithAuthor } from '@modules/reaction';

import {
  type ChatDeltaNewDto,
  ReactionDeletedPayload,
  ServerToClientEvent,
  type TypedServer,
} from '../types';

@Injectable()
export class RealtimeChatEventsService {
  private server: TypedServer;

  setServer(server: TypedServer) {
    this.server = server;
  }

  emitNewMessage(message: MessageWithAuthor) {
    this.server.to(`chat:${message.chatId}`).emit(ServerToClientEvent.CHAT_MESSAGE_NEW, message);
  }

  emitNewReaction(reaction: ReactionWithAuthor, chatId: number) {
    this.server.to(`chat:${chatId}`).emit(ServerToClientEvent.CHAT_REACTION_NEW, reaction);
  }

  emitReactionDeleted(payload: ReactionDeletedPayload, chatId: number) {
    this.server.to(`chat:${chatId}`).emit(ServerToClientEvent.CHAT_REACTION_DELETE, payload);
  }

  emitNewChatDelta(payload: ChatDeltaNewDto) {
    this.server
      .to(`chat:delta:${payload.chatId}`)
      .emit(ServerToClientEvent.CHAT_DELTA_NEW, payload);
  }
}
