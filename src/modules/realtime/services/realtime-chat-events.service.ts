import { Injectable } from '@nestjs/common';

import { UserChat } from '@modules/chat';
import type { MessageWithAuthor } from '@modules/message';
import { ReactionWithAuthor } from '@modules/reaction';

import {
  type ChatDeltaNewDto,
  ChatDeltaUpdateDto,
  MessageDeletedPayload,
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

  emitUserOnline(toUserId: number, onlineUserId: number) {
    this.server
      .to(`user:${toUserId}`)
      .emit(ServerToClientEvent.CHAT_PRESENCE_USER_ONLINE, onlineUserId);
  }

  emitUserOffline(toUserId: number, offlineUserId: number) {
    this.server
      .to(`user:${toUserId}`)
      .emit(ServerToClientEvent.CHAT_PRESENCE_USER_OFFLINE, offlineUserId);
  }

  emitNewChatToUser(userId: number, chat: UserChat) {
    this.server.to(`user:${userId}`).emit(ServerToClientEvent.CHAT_NEW, chat);
  }

  emitNewMessage(message: MessageWithAuthor) {
    this.server.to(`chat:${message.chatId}`).emit(ServerToClientEvent.CHAT_MESSAGE_NEW, message);
  }

  emitMessageUpdated(message: MessageWithAuthor) {
    this.server.to(`chat:${message.chatId}`).emit(ServerToClientEvent.CHAT_MESSAGE_UPDATE, message);
  }

  emitMessageDeleted(payload: MessageDeletedPayload) {
    this.server.to(`chat:${payload.chatId}`).emit(ServerToClientEvent.CHAT_MESSAGE_DELETE, payload);
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

  emitUpdatedChatDelta(payload: ChatDeltaUpdateDto) {
    this.server
      .to(`chat:delta:${payload.chatId}`)
      .emit(ServerToClientEvent.CHAT_DELTA_UPDATE, payload);
  }
}
