import { Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';

import { Nullable } from '@common/types';

import type {
  ChatParticipant,
  ChatParticipantWithUser,
  PrivateChatIdTitleDto,
  UpdateLastRead,
} from '../types';
import type { CreateChatParticipantDto } from '../dto/create-chat-participant.dto';
import { ChatParticipantRepository } from '../repositories/chat-participant.repository';

@Injectable()
export class ChatParticipantService {
  constructor(private readonly chatParticipantRepository: ChatParticipantRepository) {}

  async findByUserId(userId: number): Promise<ChatParticipant[]> {
    return this.chatParticipantRepository.findByUserId(userId);
  }

  async findByChatIdAndUserId(chatId: number, userId: number): Promise<Nullable<ChatParticipant>> {
    return this.chatParticipantRepository.findByChatIdAndUserId(chatId, userId);
  }

  async create(
    createDto: CreateChatParticipantDto,
    manager?: EntityManager,
  ): Promise<ChatParticipant> {
    return this.chatParticipantRepository.create(createDto, manager);
  }

  async updateLastRead(records: UpdateLastRead[]): Promise<void> {
    return this.chatParticipantRepository.updateLastReadBatch(records);
  }

  async findPrivateChatsTitle(
    chatsIds: number[],
    userId: number,
    manager?: EntityManager,
  ): Promise<PrivateChatIdTitleDto> {
    return this.chatParticipantRepository.findPrivateChatsTitle(chatsIds, userId, manager);
  }

  async findChatUsers(chatId: number): Promise<ChatParticipantWithUser[]> {
    return this.chatParticipantRepository.findChatUsers(chatId);
  }
}
