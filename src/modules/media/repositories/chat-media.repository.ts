import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, EntityManager, In, Repository } from 'typeorm';

import { Nullable } from '@common/types';

import { ChatMedia, ChatMediaRole, CreateChatMediaDto, UpdateChatMediaDto } from '../types';
import { ChatMediaEntity } from '../entities/chat-media.entity';
import { toChatMediaMapper } from '../mappers/to-chat-media-mapper';

@Injectable()
export class ChatMediaRepository {
  constructor(
    @InjectRepository(ChatMediaEntity)
    private readonly chatMediaRepository: Repository<ChatMediaEntity>,
  ) {}

  async findMainByChatAndRole(
    chatId: number,
    role: ChatMediaRole,
    manager?: EntityManager,
  ): Promise<Nullable<ChatMedia>> {
    const repository = this.getRepository(manager);
    const chatMedia = await repository.findOne({ where: { chatId, role, isMain: true } });
    return chatMedia ? toChatMediaMapper(chatMedia) : null;
  }

  async findMainWithMediaByChatAndRole(
    chatId: number,
    role: ChatMediaRole,
    manager?: EntityManager,
  ): Promise<Nullable<ChatMedia>> {
    const repository = this.getRepository(manager);
    const chatMedia = await repository.findOne({
      where: { chatId, role, isMain: true },
      relations: { media: true },
    });
    return chatMedia ? toChatMediaMapper(chatMedia) : null;
  }

  async findAllByChatAndRole(
    chatId: number,
    role: ChatMediaRole,
    manager?: EntityManager,
  ): Promise<ChatMedia[]> {
    const repository = this.getRepository(manager);
    const chatMedia = await repository.find({ where: { chatId, role } });
    return chatMedia.map((um) => toChatMediaMapper(um));
  }

  async findAllWithMediaByChatAndRole(
    chatId: number,
    role: ChatMediaRole,
    manager?: EntityManager,
  ): Promise<ChatMedia[]> {
    const repository = this.getRepository(manager);
    const chatMedia = await repository.find({
      where: { chatId, role },
      relations: { media: true },
    });
    return chatMedia.map((um) => toChatMediaMapper(um));
  }

  async findOneWithMediaByChatMediaAndRole(
    chatId: number,
    mediaId: number,
    role: ChatMediaRole,
    manager?: EntityManager,
  ): Promise<Nullable<ChatMedia>> {
    const repository = this.getRepository(manager);
    const chatMedia = await repository.findOne({
      where: { chatId, mediaId, role },
      relations: { media: true },
    });
    return chatMedia ? toChatMediaMapper(chatMedia) : null;
  }

  async findAllMainByChatIds(
    chatIds: number[],
    role: ChatMediaRole,
    manager?: EntityManager,
  ): Promise<ChatMedia[]> {
    if (chatIds.length === 0) return [];

    const repository = this.getRepository(manager);
    const chatMedia = await repository.find({
      where: {
        chatId: In(chatIds),
        role,
        isMain: true,
      },
      relations: { media: true },
    });

    return chatMedia.map((um) => toChatMediaMapper(um));
  }

  async create(chatMedia: CreateChatMediaDto, manager?: EntityManager): Promise<ChatMedia> {
    const repository = this.getRepository(manager);
    const createdMedia = await repository.save(chatMedia);

    return toChatMediaMapper(createdMedia);
  }

  async update(
    id: number,
    chatMedia: UpdateChatMediaDto,
    manager?: EntityManager,
  ): Promise<Nullable<ChatMedia>> {
    const repository = this.getRepository(manager);
    const entity = await repository.preload({ id, ...chatMedia });
    if (!entity) return null;
    const updatedMedia = await repository.save(entity);
    return toChatMediaMapper(updatedMedia);
  }

  async delete(id: number, manager?: EntityManager): Promise<DeleteResult> {
    const repository = this.getRepository(manager);
    return repository.delete(id);
  }

  private getRepository(manager?: EntityManager) {
    return manager ? manager.getRepository(ChatMediaEntity) : this.chatMediaRepository;
  }
}
