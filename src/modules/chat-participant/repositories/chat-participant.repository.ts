import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type EntityManager, In, Not, Repository } from 'typeorm';

import { Nullable } from '@common/types';

import type { ChatParticipant, ChatParticipantWithUser, PrivateChatTitleDto } from '../types';
import type { CreateChatParticipantDto } from '../dto/create-chat-participant.dto';
import { ChatParticipantEntity } from '../entities/chat-participant.entity';
import { toChatParticipantMapper } from '../mappers/to-chat-participant.mapper';
import { toChatParticipantWithUser } from '../mappers/to-chat-participant-with-user.mapper';
import { toPrivateChatTitleMapper } from '../mappers/to-private-chat-title.mapper';

@Injectable()
export class ChatParticipantRepository {
  constructor(
    @InjectRepository(ChatParticipantEntity)
    private readonly chatParticipantRepository: Repository<ChatParticipantEntity>,
  ) {}

  async create(
    createDto: CreateChatParticipantDto,
    manager?: EntityManager,
  ): Promise<ChatParticipant> {
    const repository = this.getRepository(manager);

    const chatParticipant = repository.create(createDto);
    const created = await repository.save(chatParticipant);

    return toChatParticipantMapper(created);
  }

  async findByUserId(userId: number): Promise<ChatParticipant[]> {
    const participants = await this.chatParticipantRepository.find({
      where: { userId },
    });

    return participants.map(toChatParticipantMapper);
  }

  async findByChatIdAndUserId(chatId: number, userId: number): Promise<Nullable<ChatParticipant>> {
    const participant = await this.chatParticipantRepository.findOne({
      where: { chatId, userId },
    });

    return participant ? toChatParticipantMapper(participant) : null;
  }

  async findPrivateChatsTitle(
    chatsIds: number[],
    userId: number,
    manager?: EntityManager,
  ): Promise<PrivateChatTitleDto> {
    const repository = this.getRepository(manager);

    const chats = await repository.find({
      where: { chatId: In(chatsIds), userId: Not(userId) },
      relations: ['user'],
      select: {
        id: true,
        chatId: true,
        user: {
          username: true,
        },
      },
    });

    return toPrivateChatTitleMapper(chats);
  }

  async findChatUsers(chatId: number): Promise<ChatParticipantWithUser[]> {
    const participants = await this.chatParticipantRepository.find({
      where: { chatId },
      select: {
        id: true,
        joinedAt: true,
        user: true,
      },
      relations: ['user'],
    });

    return participants.map(toChatParticipantWithUser);
  }

  private getRepository(manager?: EntityManager): Repository<ChatParticipantEntity> {
    return manager ? manager.getRepository(ChatParticipantEntity) : this.chatParticipantRepository;
  }
}
