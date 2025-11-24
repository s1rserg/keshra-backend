import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Nullable } from '@common/types';

import { ReactionWithAuthor } from '../types';
import { CreateReactionDto } from '../dto/create-reaction.dto';
import { ReactionEntity } from '../entities/reaction.entity';
import { toReactionWithAuthorMapper } from '../mappers/to-reaction-with-author.mapper';

@Injectable()
export class ReactionRepository {
  constructor(
    @InjectRepository(ReactionEntity)
    private readonly reactionRepository: Repository<ReactionEntity>,
  ) {}

  async create(dto: CreateReactionDto, authorId: number): Promise<ReactionWithAuthor> {
    let entity = await this.reactionRepository.findOne({
      where: { authorId, messageId: dto.messageId },
    });

    if (entity) {
      entity.emoji = dto.emoji;
      await this.reactionRepository.save(entity);
    } else {
      const newReaction = this.reactionRepository.create({
        ...dto,
        authorId,
      });
      entity = await this.reactionRepository.save(newReaction);
    }

    const reactionWithAuthor = await this.reactionRepository.findOne({
      where: { id: entity.id },
      relations: { author: true },
    });

    if (!reactionWithAuthor) {
      throw new InternalServerErrorException('Failed to fetch created reaction');
    }

    return toReactionWithAuthorMapper(reactionWithAuthor);
  }

  async delete(messageId: number, authorId: number): Promise<Nullable<number>> {
    const reaction = await this.reactionRepository.findOne({
      where: { messageId, authorId },
      relations: { message: true },
      select: {
        id: true,
        message: {
          id: true,
          chatId: true,
        },
      },
    });

    if (!reaction) return null;

    const chatId = reaction.message.chatId;

    await this.reactionRepository.remove(reaction);

    return chatId;
  }
}
