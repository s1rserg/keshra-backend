import { Injectable } from '@nestjs/common';

import { PresenceService } from '@infrastructure/redis';

import { RealtimeChatEventsService } from './realtime-chat-events.service';

@Injectable()
export class RealtimeChatPresenceService {
  constructor(
    private readonly presenceRedis: PresenceService,
    private readonly chatEvents: RealtimeChatEventsService,
  ) {}

  async handleUserConnect(userId: number) {
    await this.presenceRedis.addOnlineUser(userId);

    const friendsToNotify = await this.presenceRedis.getOnlineIntersection(userId);
    friendsToNotify.forEach((friendId) => {
      this.chatEvents.emitUserOnline(Number(friendId), userId);
    });
  }

  async handleUserDisconnect(userId: number) {
    const friendsToNotify = await this.presenceRedis.getOnlineIntersection(userId);
    await this.presenceRedis.removeOnlineUser(userId);

    friendsToNotify.forEach((friendId) => {
      this.chatEvents.emitUserOffline(Number(friendId), userId);
    });
  }

  async exchangePresence(userId1: number, userId2: number) {
    const isUser1Online = await this.presenceRedis.isUserOnline(userId1);
    if (isUser1Online) {
      this.chatEvents.emitUserOnline(userId2, userId1);
    }

    const isUser2Online = await this.presenceRedis.isUserOnline(userId2);
    if (isUser2Online) {
      this.chatEvents.emitUserOnline(userId1, userId2);
    }
  }
}
