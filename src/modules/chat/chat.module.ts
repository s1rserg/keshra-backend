import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatParticipantModule } from '@modules/chat-participant';
import { MediaModule } from '@modules/media';

import { ChatEntity } from './entities/chat.entity';
import { ChatService } from './services/chat.service';
import { ChatAccessService } from './services/chat-access.service';
import { ChatReadSyncService } from './services/chat-read-sync.service';
import { OuterChatService } from './services/outer-chat.service';
import { ChatRepository } from './repositories/chat.repository';
import { ChatController } from './chat.controller';

import { readSyncScheduleConfiguration } from './configs';

// todo create SQL errors map by constraints names
@Module({
  imports: [
    TypeOrmModule.forFeature([ChatEntity]),
    ChatParticipantModule,
    MediaModule,
    ConfigModule.forFeature(readSyncScheduleConfiguration),
  ],
  controllers: [ChatController],
  providers: [
    ChatRepository,
    ChatService,
    OuterChatService,
    ChatAccessService,
    ChatReadSyncService,
  ],
  exports: [OuterChatService, ChatReadSyncService],
})
export class ChatModule {}
