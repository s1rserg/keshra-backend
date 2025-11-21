import { Injectable, NotFoundException } from '@nestjs/common';

import { MessageService } from '@modules/message';

import { MessageApiResponseDto } from '@common/dto/message-api-response.dto';

import { CreateReactionDto } from '../dto/create-reaction.dto';
import { ReactionRepository } from '../repositories/reaction.repository';

@Injectable()
export class ReactionService {
  constructor(
    private readonly reactionRepository: ReactionRepository,
    private readonly messageService: MessageService,
  ) {}

  async toggle(createReactionDto: CreateReactionDto, userId: number) {
    const message = await this.messageService.findOneById(
      createReactionDto.messageId,
      userId,
      createReactionDto.chatId,
    );
    if (!message) throw new NotFoundException('Message not found');

    return this.reactionRepository.create(createReactionDto, userId);
  }

  async remove(messageId: number, userId: number): Promise<MessageApiResponseDto> {
    await this.reactionRepository.delete(messageId, userId);
    return { message: `User was successfully deleted` };
  }
}
