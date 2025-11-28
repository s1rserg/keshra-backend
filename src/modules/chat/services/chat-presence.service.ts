import { Injectable } from '@nestjs/common';

import { PresenceService } from '@infrastructure/redis';

@Injectable()
export class ChatPresenceService {
  constructor(private readonly presenceRedis: PresenceService) {}

  async refreshFriendsCache(userId: number, friendIds: number[]) {
    await this.presenceRedis.setFriendsCache(userId, friendIds);
  }

  async addFriendToCache(userId: number, friendId: number): Promise<void> {
    await this.presenceRedis.addFriendToCache(userId, friendId);
  }
}
