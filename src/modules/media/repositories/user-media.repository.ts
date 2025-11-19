import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, EntityManager, In, Repository } from 'typeorm';

import { Nullable } from '@common/types';

import { CreateUserMediaDto, UpdateUserMediaDto, UserMedia, UserMediaRole } from '../types';
import { UserMediaEntity } from '../entities/user-media.entity';
import { toUserMediaMapper } from '../mappers/to-user-media-mapper';

@Injectable()
export class UserMediaRepository {
  constructor(
    @InjectRepository(UserMediaEntity)
    private readonly userMediaRepository: Repository<UserMediaEntity>,
  ) {}

  async findMainByUserAndRole(
    userId: number,
    role: UserMediaRole,
    manager?: EntityManager,
  ): Promise<Nullable<UserMedia>> {
    const repository = this.getRepository(manager);
    const userMedia = await repository.findOne({ where: { userId, role, isMain: true } });
    return userMedia ? toUserMediaMapper(userMedia) : null;
  }

  async findMainWithMediaByUserAndRole(
    userId: number,
    role: UserMediaRole,
    manager?: EntityManager,
  ): Promise<Nullable<UserMedia>> {
    const repository = this.getRepository(manager);
    const userMedia = await repository.findOne({
      where: { userId, role, isMain: true },
      relations: { media: true },
    });
    return userMedia ? toUserMediaMapper(userMedia) : null;
  }

  async findAllByUserAndRole(
    userId: number,
    role: UserMediaRole,
    manager?: EntityManager,
  ): Promise<UserMedia[]> {
    const repository = this.getRepository(manager);
    const userMedia = await repository.find({ where: { userId, role } });
    return userMedia.map((um) => toUserMediaMapper(um));
  }

  async findAllWithMediaByUserAndRole(
    userId: number,
    role: UserMediaRole,
    manager?: EntityManager,
  ): Promise<UserMedia[]> {
    const repository = this.getRepository(manager);
    const userMedia = await repository.find({
      where: { userId, role },
      relations: { media: true },
    });
    return userMedia.map((um) => toUserMediaMapper(um));
  }

  async findOneWithMediaByUserMediaAndRole(
    userId: number,
    mediaId: number,
    role: UserMediaRole,
    manager?: EntityManager,
  ): Promise<Nullable<UserMedia>> {
    const repository = this.getRepository(manager);
    const userMedia = await repository.findOne({
      where: { userId, mediaId, role },
      relations: { media: true },
    });
    return userMedia ? toUserMediaMapper(userMedia) : null;
  }

  async findAllMainByUserIds(
    userIds: number[],
    role: UserMediaRole,
    manager?: EntityManager,
  ): Promise<UserMedia[]> {
    const repository = this.getRepository(manager);
    const userMedia = await repository.find({
      where: {
        userId: In(userIds),
        role,
        isMain: true,
      },
      relations: { media: true },
    });

    return userMedia.map((um) => toUserMediaMapper(um));
  }

  async create(userMedia: CreateUserMediaDto, manager?: EntityManager): Promise<UserMedia> {
    const repository = this.getRepository(manager);
    const createdMedia = await repository.save(userMedia);

    return toUserMediaMapper(createdMedia);
  }

  async update(
    id: number,
    userMedia: UpdateUserMediaDto,
    manager?: EntityManager,
  ): Promise<Nullable<UserMedia>> {
    const repository = this.getRepository(manager);
    const entity = await repository.preload({ id, ...userMedia });
    if (!entity) return null;
    const updatedMedia = await repository.save(entity);
    return toUserMediaMapper(updatedMedia);
  }

  async delete(id: number, manager?: EntityManager): Promise<DeleteResult> {
    const repository = this.getRepository(manager);
    return repository.delete(id);
  }

  private getRepository(manager?: EntityManager) {
    return manager ? manager.getRepository(UserMediaEntity) : this.userMediaRepository;
  }
}
