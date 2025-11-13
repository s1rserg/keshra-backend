import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppJwtModule } from '@infrastructure/app-jwt-module';
import { ChatModule } from '@modules/chat';

import { wsConfiguration } from './config/ws.config';
import { RealtimeChatService } from './services/realtime-chat.service';
import { RealtimeChatEventsService } from './services/realtime-chat-events.service';
import { ChatGateway } from './gateways/chat.gateway';

@Module({
  imports: [ConfigModule.forFeature(wsConfiguration), AppJwtModule, ChatModule],
  providers: [ChatGateway, RealtimeChatEventsService, RealtimeChatService],
  exports: [RealtimeChatEventsService],
})
export class RealtimeModule {}
