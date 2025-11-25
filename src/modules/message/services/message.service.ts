import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { type Chat, OuterChatService } from '@modules/chat';
import { ChatParticipantService } from '@modules/chat-participant';
import { UserAvatarService } from '@modules/media';
import { RealtimeChatEventsService } from '@modules/realtime';

import { Nullable } from '@common/types';
import { isNonEmptyArray } from '@common/utils/non-empty-check';

import type { Message, MessageWithAuthor } from '../types';
import type { CreateMessageDto } from '../dto/create-message.dto';
import type { GetMessagesQueryDto } from '../dto/get-messages-query.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { MessageRepository } from '../repositories/message.repository';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly chatService: OuterChatService,
    private readonly realtimeChatEventsService: RealtimeChatEventsService,
    private readonly chatParticipantService: ChatParticipantService,
    private readonly dataSource: DataSource,
    private readonly userAvatarService: UserAvatarService,
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

      const messageWithAuthor = await this.messageRepository.findOneByIdWithAuthor(
        createdMessage.id,
        manager,
      );

      if (!messageWithAuthor) {
        throw new InternalServerErrorException('Can not create message.');
      }

      messageWithAuthor.author.avatar = await this.userAvatarService.findMainAvatar(
        messageWithAuthor.authorId,
      );

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

    const messages = await this.messageRepository.findAllByChatId(query);

    await this.enrichAuthorsWithAvatars(messages);

    return messages;
  }

  async findOneById(id: number, userId: number, chatId: number): Promise<Nullable<Message>> {
    const hasAccess = await this.userHasAccessToChat(userId, chatId);
    if (!hasAccess) throw new ForbiddenException('You do not have access to this chat');

    return this.messageRepository.findOneById(id);
  }

  async update(
    id: number,
    userId: number,
    updateMessageDto: UpdateMessageDto,
  ): Promise<MessageWithAuthor> {
    const message = await this.messageRepository.findOneById(id);
    if (!message) throw new NotFoundException('Message not found');

    if (message.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let newPreview = '';

    try {
      const manager = queryRunner.manager;

      await this.messageRepository.update(id, updateMessageDto.content, manager);

      const updatedMessage = await this.messageRepository.findOneByIdWithAuthor(id, manager);

      if (!updatedMessage)
        throw new InternalServerErrorException('Failed to retrieve updated message');

      const chat = await this.chatService.findByIdOrThrow(message.chatId, manager);

      if (chat.lastMessageId === message.id) {
        newPreview = this.buildMessagePreview(updatedMessage.content);

        await this.chatService.updateLastMessagePreview(chat.id, newPreview, manager);
      }

      await queryRunner.commitTransaction();

      this.notifyWsMessageUpdate(
        updatedMessage,
        newPreview ? chat.lastMessageAuthor! : undefined,
        newPreview ? newPreview : undefined,
      );
      return updatedMessage;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number, userId: number): Promise<void> {
    const message = await this.messageRepository.findOneById(id);
    if (!message) throw new NotFoundException('Message not found');

    if (message.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let replacementAuthorName: string | undefined;
    let replacementPreview: string | undefined;
    const chatId = message.chatId;

    try {
      const manager = queryRunner.manager;

      await this.messageRepository.softDelete(id, manager);

      const chat = await this.chatService.findByIdOrThrow(chatId, manager);

      if (chat.lastMessageId === message.id) {
        const newLastMessage = await this.messageRepository.findLastMessageInChat(chatId, manager);

        if (newLastMessage) {
          replacementAuthorName = this.getAuthorName(newLastMessage.author);
          replacementPreview = this.buildMessagePreview(newLastMessage.content);

          await this.chatService.updateLastMessageInfo(
            {
              chatId: chatId,
              lastMessageId: newLastMessage.id,
              lastMessageAuthorId: newLastMessage.authorId,
              lastMessageAuthor: replacementAuthorName,
              lastMessagePreview: replacementPreview,
              lastSegNumber: newLastMessage.segNumber,
            },
            manager,
          );
        } else {
          await this.chatService.clearLastMessageInfo(chatId, manager);
          replacementAuthorName = '';
          replacementPreview = '';
        }
      }

      await queryRunner.commitTransaction();

      this.notifyWsMessageDelete(id, chatId, replacementAuthorName, replacementPreview);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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

  private notifyWsMessageUpdate(
    message: MessageWithAuthor,
    newLastMessageAuthor?: string,
    newLastMessagePreview?: string,
  ) {
    try {
      this.realtimeChatEventsService.emitMessageUpdated(message);

      if (newLastMessageAuthor && newLastMessagePreview) {
        this.realtimeChatEventsService.emitUpdatedChatDelta({
          chatId: message.chatId,
          lastMessageAuthor: newLastMessageAuthor,
          lastMessagePreview: newLastMessagePreview,
        });
      }
    } catch (_error) {
      // ignore WS errors
    }
  }

  private notifyWsMessageDelete(
    messageId: number,
    chatId: number,
    newLastMessageAuthor?: string,
    newLastMessagePreview?: string,
  ) {
    try {
      this.realtimeChatEventsService.emitMessageDeleted({
        messageId,
        chatId,
      });

      if (newLastMessageAuthor && newLastMessagePreview) {
        this.realtimeChatEventsService.emitUpdatedChatDelta({
          chatId,
          lastMessageAuthor: newLastMessageAuthor,
          lastMessagePreview: newLastMessagePreview,
        });
      }
    } catch (_error) {
      // ignore WS errors because WS has its own error handling
    }
  }

  private async enrichAuthorsWithAvatars(messages: MessageWithAuthor[]): Promise<void> {
    const authorIdsSet = new Set<number>();

    messages.forEach((message) => {
      authorIdsSet.add(message.authorId);
      if (message.reactions) {
        message.reactions.forEach((reaction) => {
          authorIdsSet.add(reaction.authorId);
        });
      }
    });

    if (authorIdsSet.size === 0) return;

    const uniqueIds = Array.from(authorIdsSet);

    if (isNonEmptyArray(uniqueIds)) {
      const avatarsMap = await this.userAvatarService.getAvatarsByUserIds(uniqueIds);

      messages.forEach((message) => {
        const messageAuthorAvatar = avatarsMap[message.authorId];
        if (messageAuthorAvatar && message.author) {
          message.author.avatar = messageAuthorAvatar;
        }

        message.reactions?.forEach((reaction) => {
          const reactionAuthorAvatar = avatarsMap[reaction.authorId];
          if (reactionAuthorAvatar && reaction.author) {
            reaction.author.avatar = reactionAuthorAvatar;
          }
        });
      });
    }
  }
}
