import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { type Chat, OuterChatService } from '@modules/chat';
import { ChatParticipantService } from '@modules/chat-participant';
import { RealtimeChatEventsService } from '@modules/realtime';

import type { Message, MessageWithAuthor } from '../types';
import type { CreateMessageDto } from '../dto/create-message.dto';
import type { GetMessagesQueryDto } from '../dto/get-messages-query.dto';
import { MessageRepository } from '../repositories/message.repository';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly chatService: OuterChatService,
    private readonly realtimeChatEventsService: RealtimeChatEventsService,
    private readonly chatParticipantService: ChatParticipantService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createMessageDto: CreateMessageDto, activeUserId: number): Promise<Message> {
    const hasAccess = await this.userHasAccessToChat(activeUserId, createMessageDto.chatId);
    if (!hasAccess) throw new ForbiddenException('You do not have access to this chat');

    // ! transaction start
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const chat = await this.chatService.findByIdOrThrow(createMessageDto.chatId, manager);

      const createdMessage = await this.messageRepository.create(
        createMessageDto,
        chat.lastSegNumber + 1,
        activeUserId,
        manager,
      );

      const messageWithAuthor = await this.messageRepository.findOneById(
        createdMessage.id,
        manager,
      );

      if (!messageWithAuthor) {
        throw new InternalServerErrorException('Can not create message.');
      }

      const lastMessageAuthor = this.getAuthorName(messageWithAuthor.author);
      const lastMessagePreview = this.buildMessagePreview(messageWithAuthor.content);

      await this.chatService.updateLastMessageInfo(
        {
          chatId: messageWithAuthor.chatId,
          lastMessageId: messageWithAuthor.id,
          lastMessageAuthorId: messageWithAuthor.authorId,
          lastMessageAuthor,
          lastMessagePreview,
          lastSegNumber: messageWithAuthor.segNumber,
        },
        manager,
      );

      await this.chatParticipantService.updateLastRead([
        {
          segNumber: messageWithAuthor.segNumber,
          chatId: chat.id,
          userId: activeUserId,
        },
      ]);

      await queryRunner.commitTransaction();
      // ! transaction end

      this.notifyWsNewMessage(messageWithAuthor, lastMessageAuthor, lastMessagePreview);

      return createdMessage;
    } catch (_error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to create message.');
    } finally {
      await queryRunner.release();
    }
  }

  async findAllByChatId(query: GetMessagesQueryDto, userId: number): Promise<MessageWithAuthor[]> {
    const hasAccess = await this.userHasAccessToChat(userId, query.chatId);
    if (!hasAccess) throw new ForbiddenException('You do not have access to this chat');

    return this.messageRepository.findAllByChatId(query);
  }

  // ! PRIVATE METHODS
  private async userHasAccessToChat(userId: number, chatArg: number | Chat): Promise<boolean> {
    const chat: Chat =
      typeof chatArg === 'number' ? await this.chatService.findByIdOrThrow(chatArg) : chatArg;

    return this.chatService.checkUserAccessToChat(userId, chat);
  }

  private buildMessagePreview(content: string): string {
    return content.length > 100 ? `${content.slice(0, 100)}...` : content;
  }

  private getAuthorName({ email, username }: MessageWithAuthor['author']): string {
    return username || email;
  }

  private notifyWsNewMessage(
    message: MessageWithAuthor,
    lastMessageAuthor: string,
    lastMessagePreview: string,
  ) {
    try {
      this.realtimeChatEventsService.emitNewMessage(message);

      this.realtimeChatEventsService.emitNewChatDelta({
        chatId: message.chatId,
        lastMessageAuthor,
        lastMessagePreview,
      });
    } catch (_error) {
      // ignore WS errors because WS has its own error handling
    }
  }
}
