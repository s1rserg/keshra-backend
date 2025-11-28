import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RedisManager } from '../redis.manager';

import { REDIS_KEY_ONLINE_GLOBAL, REDIS_PREFIX_USER_FRIENDS } from '../constants';

@Injectable()
export class PresenceService implements OnModuleInit {
  private readonly logger = new Logger(PresenceService.name);
  private readonly FRIENDS_CACHE_TTL = 3600;

  constructor(private readonly redisManager: RedisManager) {}

  async onModuleInit() {
    await this.redis.del(REDIS_KEY_ONLINE_GLOBAL);
  }

  private get redis() {
    return this.redisManager.getClient();
  }

  private getFriendsKey(userId: number): string {
    return `${REDIS_PREFIX_USER_FRIENDS}:${userId}`;
  }

  async addOnlineUser(userId: number): Promise<void> {
    await this.redis.sAdd(REDIS_KEY_ONLINE_GLOBAL, String(userId));
  }

  async removeOnlineUser(userId: number): Promise<void> {
    await this.redis.sRem(REDIS_KEY_ONLINE_GLOBAL, String(userId));
  }

  async setFriendsCache(userId: number, friendIds: number[]): Promise<void> {
    if (friendIds.length === 0) return;

    const key = this.getFriendsKey(userId);
    const friendIdsStr = friendIds.map(String);

    try {
      const multi = this.redis.multi();
      multi.del(key);
      multi.sAdd(key, friendIdsStr);
      multi.expire(key, this.FRIENDS_CACHE_TTL);
      await multi.exec();
    } catch (error) {
      this.logger.error(`Failed to cache friends for user ${userId}`, error);
    }
  }

  async addFriendToCache(userId: number, friendId: number): Promise<void> {
    const key = this.getFriendsKey(userId);
    const exists = await this.redis.exists(key);
    if (!exists) return;

    await this.redis.sAdd(key, String(friendId));

    await this.redis.expire(key, this.FRIENDS_CACHE_TTL);
  }

  async isUserOnline(userId: number): Promise<boolean> {
    const isMember = await this.redis.sIsMember(REDIS_KEY_ONLINE_GLOBAL, String(userId));
    return Boolean(isMember);
  }

  async clearFriendsCache(userId: number): Promise<void> {
    await this.redis.del(this.getFriendsKey(userId));
  }

  async getOnlineIntersection(userId: number): Promise<string[]> {
    const friendsKey = this.getFriendsKey(userId);
    return this.redis.sInter([REDIS_KEY_ONLINE_GLOBAL, friendsKey]);
  }
}
