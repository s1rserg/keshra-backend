import { Injectable, NotFoundException } from '@nestjs/common';
import type { EntityManager } from 'typeorm';

import type { Nullable } from '@common/types';

import type { Chat, UpdateLastMessagePayload } from '../types';
import { ChatAccessService } from './chat-access.service';
import { ChatRepository } from '../repositories/chat.repository';

@Injectable()
export class OuterChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly chatAccessService: ChatAccessService,
  ) {}

  async findByIdOrThrow(id: number, manager?: EntityManager): Promise<Chat> {
    const chat = await this.chatRepository.findById(id, manager);
    if (!chat) throw new NotFoundException(`Chat not found`);

    return chat;
  }

  async findByIdOrNull(id: number): Promise<Nullable<Chat>> {
    return this.chatRepository.findById(id);
  }

  async updateLastMessageInfo(
    payload: UpdateLastMessagePayload,
    manager?: EntityManager,
  ): Promise<void> {
    const updateResult = await this.chatRepository.updateLastMessageInfo(payload, manager);

    if (updateResult.affected === 0) {
      throw new NotFoundException(`Can not update last message info in chat.`);
    }
  }

  async updateLastMessagePreview(
    chatId: number,
    newPreview: string,
    manager?: EntityManager,
  ): Promise<void> {
    await this.chatRepository.updateLastMessagePreview(chatId, newPreview, manager);
  }

  async clearLastMessageInfo(chatId: number, manager?: EntityManager): Promise<void> {
    await this.chatRepository.clearLastMessageInfo(chatId, manager);
  }

  checkUserAccessToChat(userId: number, chat: Chat): boolean {
    return this.chatAccessService.checkUserAccessToChat(userId, chat);
  }
}
