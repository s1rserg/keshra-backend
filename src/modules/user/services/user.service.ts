import { Injectable, NotFoundException } from '@nestjs/common';
import type { EntityManager } from 'typeorm';

import type { Nullable } from '@common/types';
import { DbErrorParser } from '@common/utils/db-error-parser';
import type { MessageApiResponseDto } from '@common/dto/message-api-response.dto';

import type { User } from '../types';
import type { CreateUserDto } from '../dto/create-user.dto';
import type { GetAllUsersQueryDto } from '../dto/get-all-users-query.dto';
import type { UpdateUserDto } from '../dto/update-user.dto';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto, manager?: EntityManager): Promise<User> {
    try {
      return await this.userRepository.create(createUserDto, manager);
    } catch (error) {
      const result = DbErrorParser.parse(error, 'User');
      if (!result) throw error;
      throw result.exception;
    }
  }

  async findAll(query: GetAllUsersQueryDto): Promise<User[]> {
    const users = await this.userRepository.findAll(query);
    if (!users.length) return users;

    return users;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne('id', id);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  async findOneByEmailOrNull(email: string): Promise<Nullable<User>> {
    return this.userRepository.findOne('email', email);
  }

  async findByUsernameOrNull(username: string): Promise<Nullable<User>> {
    return this.userRepository.findOneByUsername(username);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.update(id, updateUserDto);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  async remove(id: number): Promise<MessageApiResponseDto> {
    const result = await this.userRepository.remove(id);

    if (!result.affected) {
      throw new NotFoundException(`User not found`);
    }

    return { message: `User was successfully deleted` };
  }
}
