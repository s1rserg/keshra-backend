import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatParticipantEntity } from './entities/chat-participant.entity';
import { ChatParticipantService } from './services/chat-participant.service';
import { ChatParticipantRepository } from './repositories/chat-participant.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ChatParticipantEntity])],
  providers: [ChatParticipantRepository, ChatParticipantService],
  exports: [ChatParticipantService],
})
export class ChatParticipantModule {}
