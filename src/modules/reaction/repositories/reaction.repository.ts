import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Reaction } from '../types';
import { CreateReactionDto } from '../dto/create-reaction.dto';
import { ReactionEntity } from '../entities/reaction.entity';
import { toReactionMapper } from '../mappers/to-reaction.mapper';

@Injectable()
export class ReactionRepository {
  constructor(
    @InjectRepository(ReactionEntity)
    private readonly reactionRepository: Repository<ReactionEntity>,
  ) {}

  async create(dto: CreateReactionDto, authorId: number): Promise<Reaction> {
    const existing = await this.reactionRepository.findOne({
      where: { authorId, messageId: dto.messageId },
    });

    if (existing) {
      existing.emoji = dto.emoji;
      return this.reactionRepository.save(existing);
    }

    const newReaction = this.reactionRepository.create({
      ...dto,
      authorId,
    });
    const reaction = await this.reactionRepository.save(newReaction);

    return toReactionMapper(reaction);
  }

  async delete(messageId: number, authorId: number): Promise<void> {
    await this.reactionRepository.delete({ messageId, authorId });
  }
}
