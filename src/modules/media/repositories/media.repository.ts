import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, EntityManager, Repository } from 'typeorm';

import { CreateMediaDto, Media } from '../types';
import { MediaEntity } from '../entities/media.entity';
import { toMediaMapper } from '../mappers/to-media-mapper';

@Injectable()
export class MediaRepository {
  constructor(
    @InjectRepository(MediaEntity)
    private readonly mediaRepository: Repository<MediaEntity>,
  ) {}

  async create(media: CreateMediaDto, manager?: EntityManager): Promise<Media> {
    const repository = this.getRepository(manager);
    const newMedia = repository.create({ ...media, recordCreatedAt: new Date() });
    const createdMedia = await repository.save(newMedia);
    return toMediaMapper(createdMedia);
  }

  async delete(id: number, manager?: EntityManager): Promise<DeleteResult> {
    const repository = this.getRepository(manager);
    return repository.delete(id);
  }

  private getRepository(manager?: EntityManager) {
    return manager ? manager.getRepository(MediaEntity) : this.mediaRepository;
  }
}
