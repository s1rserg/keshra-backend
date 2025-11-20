import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatModule } from '@modules/chat';
import { ChatParticipantModule } from '@modules/chat-participant';
import { RealtimeModule } from '@modules/realtime';

import { MessageEntity } from './entities/message.entity';
import { MessageService } from './services/message.service';
import { MessageRepository } from './repositories/message.repository';
import { MessageController } from './message.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageEntity]),
    ChatModule,
    RealtimeModule,
    ChatParticipantModule,
  ],
  controllers: [MessageController],
  providers: [MessageRepository, MessageService],
})
export class MessageModule {}
