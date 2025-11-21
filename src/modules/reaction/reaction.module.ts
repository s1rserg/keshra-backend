import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessageModule } from '@modules/message';

import { ReactionEntity } from './entities/reaction.entity';
import { ReactionService } from './services/reaction.service';
import { ReactionRepository } from './repositories/reaction.repository';
import { ReactionController } from './reaction.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReactionEntity]), MessageModule],
  controllers: [ReactionController],
  providers: [ReactionRepository, ReactionService],
})
export class ReactionModule {}
