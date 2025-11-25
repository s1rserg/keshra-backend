import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  type EntityManager,
  FindOneOptions,
  In,
  Like,
  Repository,
  type UpdateResult,
} from 'typeorm';

import type { Nullable } from '@common/types';

import type {
  Chat,
  CreateChatPayload,
  CreatePrivateChatPayload,
  CreatePublicChatPayload,
  PrivateChat,
  PublicChat,
  UpdateLastMessagePayload,
} from '../types';
import { ChatType } from '../enums/chat-type.enum';
import { ChatEntity } from '../entities/chat.entity';
import { toChatMapper } from '../mappers/to-chat.mapper';
import { toPrivateChatMapper } from '../mappers/to-private-chat.mapper';
import { toPublicChatMapper } from '../mappers/to-public-chat.mapper';

@Injectable()
export class ChatRepository {
  constructor(
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
  ) {}

  async searchPublicChatsByTitle(query: string): Promise<PublicChat[]> {
    const chats = await this.chatRepository.find({
      where: {
        title: Like(`${query}%`),
        type: ChatType.PUBLIC,
      },
      order: { title: 'ASC' },
      take: 20,
    });
    return chats.map(toPublicChatMapper);
  }

  async findByIds(ids: number[]): Promise<Chat[]> {
    const chats = await this.chatRepository.find({ where: { id: In(ids) } });
    return chats.map(toChatMapper);
  }

  async createPrivateChat(payload: CreatePrivateChatPayload): Promise<PrivateChat> {
    const chat = await this.create(payload);
    const privateChat = await this.findPrivateById(chat.id);

    if (!privateChat) {
      throw new InternalServerErrorException(
        'Unable to retrieve private chat after creation. Please contact support.',
      );
    }

    return privateChat;
  }

  async createPublicChat(payload: CreatePublicChatPayload): Promise<PublicChat> {
    const chat = await this.create(payload);
    return toPublicChatMapper(chat);
  }

  async findByTitle(title: string): Promise<Nullable<Chat>> {
    const chat = await this.chatRepository.findOneBy({ title });
    return chat ? toChatMapper(chat) : null;
  }

  async findByDmKey(dmKey: string): Promise<Nullable<PrivateChat>> {
    const chat = await this.chatRepository.findOneBy({ dmKey });
    return chat ? toPrivateChatMapper(chat) : null;
  }

  async findById(id: number, manager?: EntityManager): Promise<Nullable<Chat>> {
    const repository = this.getRepository(manager);

    const findOptions: FindOneOptions<ChatEntity> = { where: { id } };
    if (manager) {
      findOptions.lock = { mode: 'pessimistic_write' };
    }

    const chat = await repository.findOne(findOptions);
    return chat ? toChatMapper(chat) : null;
  }

  async findPrivateById(id: number): Promise<Nullable<PrivateChat>> {
    const chat = await this.chatRepository.findOne({
      where: { id },
    });

    if (!chat) return null;

    return toPrivateChatMapper(chat);
  }

  async updateLastMessageInfo(
    payload: UpdateLastMessagePayload,
    manager?: EntityManager,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(manager);

    const { chatId, ...rest } = payload;
    return repository.update(chatId, rest);
  }

  async updateLastMessagePreview(
    chatId: number,
    newPreview: string,
    manager?: EntityManager,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(manager);

    return repository.update(chatId, {
      lastMessagePreview: newPreview,
    });
  }

  async clearLastMessageInfo(chatId: number, manager?: EntityManager): Promise<UpdateResult> {
    const repository = this.getRepository(manager);

    return repository.update(chatId, {
      lastMessageId: null,
      lastMessagePreview: null,
      lastMessageAuthor: null,
      lastMessageAuthorId: null,
    });
  }

  // ! PRIVATE METHODS
  private getRepository(manager?: EntityManager): Repository<ChatEntity> {
    return manager ? manager.getRepository(ChatEntity) : this.chatRepository;
  }
  private async create(chatPayload: CreateChatPayload): Promise<ChatEntity> {
    const createdChat = this.chatRepository.create(chatPayload);

    return this.chatRepository.save(createdChat);
  }
}
