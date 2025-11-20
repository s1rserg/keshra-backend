import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type EntityManager, In, Not, Repository } from 'typeorm';

import { Nullable } from '@common/types';

import type {
  ChatParticipant,
  ChatParticipantWithUser,
  PrivateChatIdTitleDto,
  UpdateLastRead,
} from '../types';
import type { CreateChatParticipantDto } from '../dto/create-chat-participant.dto';
import { ChatParticipantEntity } from '../entities/chat-participant.entity';
import { toChatParticipantMapper } from '../mappers/to-chat-participant.mapper';
import { toChatParticipantWithUser } from '../mappers/to-chat-participant-with-user.mapper';
import { toPrivateChatIdTitleMapper } from '../mappers/to-private-chat-id-title.mapper';

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
  ): Promise<PrivateChatIdTitleDto> {
    const repository = this.getRepository(manager);

    const chats = await repository.find({
      where: { chatId: In(chatsIds), userId: Not(userId) },
      relations: ['user'],
      select: {
        id: true,
        chatId: true,
        user: {
          id: true,
          username: true,
        },
      },
    });

    return toPrivateChatIdTitleMapper(chats);
  }

  async updateLastReadBatch(records: UpdateLastRead[]) {
    const params = records.flatMap((r) => [r.userId, r.chatId, r.segNumber]);

    const placeholders = records
      .map((_, i) => `($${i * 3 + 1}::int, $${i * 3 + 2}::int, $${i * 3 + 3}::int)`)
      .join(', ');

    const query = `
    UPDATE chat_participants AS cp
    SET last_read_seg_number = v.seg_number
    FROM (VALUES ${placeholders}) AS v(user_id, chat_id, seg_number)
    WHERE cp.user_id = v.user_id 
      AND cp.chat_id = v.chat_id
      AND (cp.last_read_seg_number IS NULL OR cp.last_read_seg_number < v.seg_number)
  `;

    await this.chatParticipantRepository.query(query, params);
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
