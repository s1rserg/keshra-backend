import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { EntityManager, Repository } from 'typeorm';

import type { AuthProvider, Nullable } from '@common/types';

import { CreateAuthDto } from '../dto/create-auth.dto';
import { AuthEntity } from '../entities/auth.entity';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
  ) {}

  async create(createAuthDto: CreateAuthDto, manager?: EntityManager): Promise<AuthEntity> {
    const repository = this.getRepository(manager);
    const auth = repository.create(createAuthDto);
    return repository.save(auth);
  }

  async findByEmailAndProvider(
    email: string,
    provider: AuthProvider,
  ): Promise<Nullable<AuthEntity>> {
    return this.authRepository.findOneBy({ email, provider });
  }

  private getRepository(manager?: EntityManager) {
    return manager ? manager.getRepository(AuthEntity) : this.authRepository;
  }
}
