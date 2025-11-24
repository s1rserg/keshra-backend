import { Injectable, NotFoundException } from '@nestjs/common';

import { UserAvatarService } from '@modules/media';
import { MessageService } from '@modules/message';
import { ReactionDeletedPayload, RealtimeChatEventsService } from '@modules/realtime';

import { MessageApiResponseDto } from '@common/dto/message-api-response.dto';

import { ReactionWithAuthor } from '../types';
import { CreateReactionDto } from '../dto/create-reaction.dto';
import { ReactionRepository } from '../repositories/reaction.repository';

@Injectable()
export class ReactionService {
  constructor(
    private readonly reactionRepository: ReactionRepository,
    private readonly messageService: MessageService,
    private readonly realtimeChatEventsService: RealtimeChatEventsService,
    private readonly userAvatarService: UserAvatarService,
  ) {}

  async toggle(createReactionDto: CreateReactionDto, userId: number) {
    const message = await this.messageService.findOneById(
      createReactionDto.messageId,
      userId,
      createReactionDto.chatId,
    );
    if (!message) throw new NotFoundException('Message not found');

    const reaction = await this.reactionRepository.create(createReactionDto, userId);

    const avatars = await this.userAvatarService.getAvatarsByUserIds([userId]);
    const userAvatar = avatars[userId];

    if (userAvatar && reaction.author) {
      reaction.author.avatar = userAvatar;
    }

    this.notifyWsNewReaction(reaction, createReactionDto.chatId);

    return reaction;
  }

  async remove(messageId: number, userId: number): Promise<MessageApiResponseDto> {
    const chatId = await this.reactionRepository.delete(messageId, userId);

    if (chatId) {
      this.notifyWsReactionDeleted({ messageId, authorId: userId }, chatId);
    }

    return { message: `Reaction was successfully deleted` };
  }

  private notifyWsNewReaction(reaction: ReactionWithAuthor, chatId: number) {
    try {
      this.realtimeChatEventsService.emitNewReaction(reaction, chatId);
    } catch (_error) {
      // ignore WS errors because WS has its own error handling
    }
  }

  private notifyWsReactionDeleted(payload: ReactionDeletedPayload, chatId: number) {
    try {
      this.realtimeChatEventsService.emitReactionDeleted(payload, chatId);
    } catch (_error) {
      // ignore WS errors because WS has its own error handling
    }
  }
}
