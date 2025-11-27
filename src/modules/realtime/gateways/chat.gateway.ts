import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  type OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { AppJwtService } from '@infrastructure/app-jwt-module';

import {
  ClientToServerEvent,
  ServerToClientEvent,
  type TypedServer,
  type TypedSocket,
} from '../types';
import { WsExceptionFilter } from '../exceptions/ws-exception.filter';
import { WsParseIntPipe } from '../pipes/ws-parse-int.pipe';
import {
  WsBadRequestException,
  WsForbiddenException,
  WsUnauthorizedException,
} from '../exceptions/ws-exceptions';
import { MarkChatReadDto } from '../dto/mark-chat-read.dto';
import { RealtimeChatService } from '../services/realtime-chat.service';
import { RealtimeChatEventsService } from '../services/realtime-chat-events.service';
import { RealtimeChatPresenceService } from '../services/realtime-chat-presence.service';

@UseFilters(WsExceptionFilter)
@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: ['http://localhost:5173', 'https://s1rserg.github.io'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: TypedServer;

  constructor(
    private readonly jwtService: AppJwtService,
    private readonly chatEvents: RealtimeChatEventsService,
    private readonly realtimeChatService: RealtimeChatService,
    private readonly presenceService: RealtimeChatPresenceService,
  ) {}

  @SubscribeMessage(ClientToServerEvent.CHAT_JOIN)
  async onJoinChat(
    @ConnectedSocket() socket: TypedSocket,
    @MessageBody(WsParseIntPipe('Chat Id')) chatId: number,
  ) {
    const user = socket.data.user!;

    const hasAccess = await this.realtimeChatService.userHasAccessToChat(user.id, chatId);
    if (!hasAccess) {
      throw new WsForbiddenException('You do not have access to this chat');
    }

    const chatRoom = `chat:${chatId}`;
    await socket.join(chatRoom);
    socket.emit(ServerToClientEvent.ME_JOINED_CHAT, { chatId });
    this.server.to(chatRoom).emit(ServerToClientEvent.CHAT_PRESENCE_USER_ONLINE, user.id);
  }

  @SubscribeMessage(ClientToServerEvent.CHAT_LEAVE)
  async onLeaveChat(
    @ConnectedSocket() socket: TypedSocket,
    @MessageBody(WsParseIntPipe('Chat Id')) chatId: number,
  ) {
    const chatRoom = `chat:${chatId}`;
    await socket.leave(chatRoom);
    socket.emit(ServerToClientEvent.ME_LEFT_CHAT, chatId);
    this.server
      .to(chatRoom)
      .emit(ServerToClientEvent.CHAT_PRESENCE_USER_OFFLINE, socket.data.user!.id);
  }

  @SubscribeMessage(ClientToServerEvent.CHAT_DELTA_JOIN)
  async onJoinChatDelta(@ConnectedSocket() socket: TypedSocket, @MessageBody() chatIds: number[]) {
    const allNumbers = chatIds.every((id) => Number.isInteger(id));
    if (!allNumbers) {
      throw new WsBadRequestException('Chat IDs must be an array of integers');
    }
    const roomsToJoin = chatIds.map((id) => `chat:delta:${id}`);
    await socket.join(roomsToJoin);
  }

  @SubscribeMessage(ClientToServerEvent.CHAT_DELTA_LEAVE)
  onLeaveChatDelta(@ConnectedSocket() socket: TypedSocket, @MessageBody() chatIds?: number[]) {
    const roomsToLeave = chatIds?.map((id) => `chat:delta:${id}`) || [];

    if (!roomsToLeave.length) {
      socket.rooms.forEach((room) => {
        if (room.startsWith('chat:delta:')) {
          roomsToLeave.push(room);
        }
      });
    }

    roomsToLeave.forEach((room) => {
      if (room.startsWith('chat:delta:')) {
        void socket.leave(room);
      }
    });
  }

  @SubscribeMessage(ClientToServerEvent.CHAT_MARK_READ)
  @UsePipes(new ValidationPipe({ transform: true }))
  async onMarkRead(
    @ConnectedSocket() socket: TypedSocket,
    @MessageBody() payload: MarkChatReadDto,
  ) {
    const user = socket.data.user!;
    await this.realtimeChatService.markChatAsRead(user.id, payload);
  }

  afterInit(server: TypedServer) {
    this.chatEvents.setServer(server);
  }

  async handleConnection(socket: TypedSocket) {
    const token = socket.handshake.headers.authorization;
    if (!token) {
      socket.emit(
        ServerToClientEvent.APP_ERROR,
        new WsUnauthorizedException('Token in handshake must be provided').toJSON(),
      );
      socket.disconnect();
      return;
    }

    try {
      const activeUser = await this.jwtService.verify(token);
      socket.data.user = activeUser;
      // personal room:
      void socket.join(`user:${activeUser.id}`);

      const { notifyListIds } = await this.presenceService.handleUserConnect(activeUser.id);

      if (notifyListIds.length > 0) {
        notifyListIds.forEach((friendId) => {
          this.server
            .to(`user:${friendId}`)
            .emit(ServerToClientEvent.CHAT_PRESENCE_USER_ONLINE, activeUser.id);
        });
      }
    } catch (_error) {
      socket.emit(
        ServerToClientEvent.APP_ERROR,
        new WsUnauthorizedException('Failed to verify token').toJSON(),
      );
      socket.disconnect();
    }
  }

  async handleDisconnect(socket: TypedSocket) {
    const user = socket.data.user;
    if (user) {
      const { notifyListIds } = await this.presenceService.handleUserDisconnect(user.id);

      if (notifyListIds.length > 0) {
        notifyListIds.forEach((friendId) => {
          this.server
            .to(`user:${friendId}`)
            .emit(ServerToClientEvent.CHAT_PRESENCE_USER_OFFLINE, user.id);
        });
      }
    }
    void socket._cleanup();
  }
}
