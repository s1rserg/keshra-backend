import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  type DeleteResult,
  type EntityManager,
  type FindOptionsWhere,
  ILike,
  In,
  Repository,
} from 'typeorm';

import type { Maybe, Nullable } from '@common/types';

import type { User } from '../types';
import type { CreateUserDto } from '../dto/create-user.dto';
import type { GetAllUsersQueryDto } from '../dto/get-all-users-query.dto';
import type { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../entities/user.entity';
import { toUserMapper } from '../mappers/to-user.mapper';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto, manager?: EntityManager): Promise<User> {
    const repository = this.getRepository(manager);
    const user = repository.create(createUserDto);
    const createdUser = await repository.save(user);
    return toUserMapper(createdUser);
  }

  async findAll(query: GetAllUsersQueryDto): Promise<User[]> {
    const where: FindOptionsWhere<UserEntity> = {};
    let take: Maybe<number>;
    let skip: Maybe<number>;

    if (query.search) {
      where.username = ILike(`%${query.search}%`);
    }
    if (query.ids?.length) {
      where.id = In(query.ids);
    }

    if (query.page && query.perPage) {
      take = query.perPage;
      skip = (query.page - 1) * query.perPage;
    }

    const users = await this.userRepository.find({ where, take, skip });
    return users.map(toUserMapper);
  }

  async findOne(
    key: keyof UserEntity,
    value: UserEntity[keyof UserEntity],
  ): Promise<Nullable<User>> {
    const user = await this.userRepository.findOneBy({ [key]: value });
    return user ? toUserMapper(user) : null;
  }

  async findOneByUsername(username: string): Promise<Nullable<User>> {
    const user = await this.userRepository.findOne({ where: { username } });
    return user ? toUserMapper(user) : null;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const entity = await this.userRepository.preload({
      id,
      ...updateUserDto,
    });

    if (!entity) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const savedUser = await this.userRepository.save(entity);

    return toUserMapper(savedUser);
  }

  async remove(id: number): Promise<DeleteResult> {
    return this.userRepository.delete(id);
  }

  private getRepository(manager?: EntityManager) {
    return manager ? manager.getRepository(UserEntity) : this.userRepository;
  }
}
