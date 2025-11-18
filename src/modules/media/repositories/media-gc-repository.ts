import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { And, type EntityManager, LessThan, MoreThan, type Repository } from 'typeorm';

import { Nullable } from '@common/types';

import { MediaGcStatus } from '../types';
import { MediaGcEntity } from '../entities/media-gc.entity';

@Injectable()
export class MediaGcRepository {
  constructor(
    @InjectRepository(MediaGcEntity)
    private readonly repository: Repository<MediaGcEntity>,
  ) {}

  async stageOrphans(manager?: EntityManager): Promise<MediaGcEntity[]> {
    const repository = this.getRepository(manager);
    const query = `
      INSERT INTO media_gc (media_id, public_id, resource_type, status)
      SELECT
        m.id AS media_id,
        m.public_id,
        m.resource_type,
        '${MediaGcStatus.PENDING}' AS status
      FROM media m
      LEFT JOIN user_media um ON um.media_id = m.id
      LEFT JOIN chat_media cm ON cm.media_id = m.id
      LEFT JOIN media_gc mgc ON mgc.media_id = m.id
      WHERE um.media_id IS NULL
        AND cm.media_id IS NULL
        AND mgc.media_id IS NULL
      ON CONFLICT (media_id) DO NOTHING
      RETURNING *;
    `;

    return repository.query(query);
  }

  async findById(id: number, manager?: EntityManager): Promise<Nullable<MediaGcEntity>> {
    const repository = this.getRepository(manager);
    return repository.findOne({ where: { id } });
  }

  async findByIdAndLock(id: number, manager: EntityManager): Promise<Nullable<MediaGcEntity>> {
    const repository = this.getRepository(manager);
    return repository.findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
  }

  async findRetryableFailedJobs(
    maxAttempts: number,
    manager?: EntityManager,
  ): Promise<MediaGcEntity[]> {
    const repository = this.getRepository(manager);
    return repository.find({
      where: {
        status: MediaGcStatus.PENDING,
        attempts: And(MoreThan(0), LessThan(maxAttempts)),
      },
    });
  }

  async save(entity: MediaGcEntity, manager?: EntityManager): Promise<MediaGcEntity> {
    const repository = this.getRepository(manager);
    return repository.save(entity);
  }

  async updateStatus(id: number, status: MediaGcStatus, manager?: EntityManager): Promise<void> {
    const repository = this.getRepository(manager);
    await repository.update(id, { status });
  }

  async delete(id: number, manager?: EntityManager): Promise<void> {
    const repository = this.getRepository(manager);
    await repository.delete(id);
  }

  private getRepository(manager?: EntityManager) {
    return manager ? manager.getRepository(MediaGcEntity) : this.repository;
  }
}
