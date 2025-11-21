import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppJwtModule } from '@infrastructure/app-jwt-module';
import { RedisModule } from '@infrastructure/redis';
import { ChatModule } from '@modules/chat';

import { wsConfiguration } from './config/ws.config';
import { RealtimeChatService } from './services/realtime-chat.service';
import { RealtimeChatEventsService } from './services/realtime-chat-events.service';
import { RealtimeChatPresenceService } from './services/realtime-chat-presence.service';
import { ChatGateway } from './gateways/chat.gateway';

@Module({
  imports: [ConfigModule.forFeature(wsConfiguration), AppJwtModule, ChatModule, RedisModule],
  providers: [
    ChatGateway,
    RealtimeChatEventsService,
    RealtimeChatService,
    RealtimeChatPresenceService,
  ],
  exports: [RealtimeChatEventsService],
})
export class RealtimeModule {}
