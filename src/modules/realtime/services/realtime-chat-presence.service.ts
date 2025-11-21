import { Injectable } from '@nestjs/common';

import { PresenceService } from '@infrastructure/redis';

@Injectable()
export class RealtimeChatPresenceService {
  constructor(private readonly presenceRedis: PresenceService) {}

  async handleUserConnect(userId: number) {
    await this.presenceRedis.addOnlineUser(userId);
    const friendsToNotify = await this.presenceRedis.getOnlineIntersection(userId);

    return {
      notifyListIds: friendsToNotify.map(Number),
    };
  }

  async handleUserDisconnect(userId: number) {
    const friendsToNotify = await this.presenceRedis.getOnlineIntersection(userId);

    await this.presenceRedis.removeOnlineUser(userId);

    return {
      notifyListIds: friendsToNotify.map(Number),
    };
  }
}
