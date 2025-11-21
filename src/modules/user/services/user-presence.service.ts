import { Injectable } from '@nestjs/common';

import { PresenceService } from '@infrastructure/redis';

@Injectable()
export class UserPresenceService {
  constructor(private readonly presenceRedis: PresenceService) {}

  async getOnlineFriends(userId: number): Promise<number[]> {
    const onlineIdsStr = await this.presenceRedis.getOnlineIntersection(userId);
    return onlineIdsStr.map(Number);
  }
}
