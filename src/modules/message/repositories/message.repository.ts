import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type EntityManager, type FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';

import { CursorDirection, type Nullable } from '@common/types';

import type { Message, MessageCursorPair, MessageWithAuthor } from '../types';
import type { CreateMessageDto } from '../dto/create-message.dto';
import type { GetMessagesQueryDto } from '../dto/get-messages-query.dto';
import { MessageEntity } from '../entities/message.entity';
import { toMessageMapper } from '../mappers/to-message.mapper';
import { toMessageWithAuthorMapper } from '../mappers/to-message-with-author.mapper';

@Injectable()
export class MessageRepository {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

  async findAllByChatId(query: GetMessagesQueryDto): Promise<MessageWithAuthor[]> {
    const { direction, limit, cursor, chatId } = query;

    const cursorWhereOptions = this.getCursorWhereOptions(cursor, direction);

    const messages = await this.messageRepository.find({
      where: { chatId, ...cursorWhereOptions },
      take: limit,
      relations: { author: true },
    });

    return messages.map(toMessageWithAuthorMapper);
  }

  async findOneById(id: number, manager?: EntityManager): Promise<Nullable<MessageWithAuthor>> {
    const repository = this.getRepository(manager);

    const message = await repository.findOne({
      where: { id },
      relations: { author: true },
    });

    return message ? toMessageWithAuthorMapper(message) : null;
  }

  async create(
    createMessageDto: CreateMessageDto,
    authorId: number,
    manager?: EntityManager,
  ): Promise<Message> {
    const repository = this.getRepository(manager);

    const createdMessage = repository.create({
      ...createMessageDto,
      authorId,
    });

    const message = await repository.save(createdMessage);
    return toMessageMapper(message);
  }

  // ! PRIVATE METHODS
  private getRepository(manager?: EntityManager): Repository<MessageEntity> {
    return manager ? manager.getRepository(MessageEntity) : this.messageRepository;
  }

  private decodeCursor(cursor: string | undefined): MessageCursorPair | null {
    if (!cursor) return null;

    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf8');
      const candidate = JSON.parse(decoded) as MessageCursorPair;
      if (candidate.id && candidate.createdAt) return candidate;
      return null;
    } catch (_error) {
      return null;
    }
  }

  private getCursorWhereOptions(
    cursor: string | undefined,
    direction: CursorDirection,
  ): FindOptionsWhere<MessageEntity> {
    const cursorWhereOptions: FindOptionsWhere<MessageEntity> = {};
    if (!cursor) return cursorWhereOptions;

    const decodedCursor = this.decodeCursor(cursor);
    if (!decodedCursor) return cursorWhereOptions;

    const directionFactor = direction === CursorDirection.NEWER ? MoreThan : LessThan;
    cursorWhereOptions.createdAt = directionFactor<Date>(new Date(decodedCursor.createdAt));
    cursorWhereOptions.id = directionFactor<number>(decodedCursor.id);

    return cursorWhereOptions;
  }
}
