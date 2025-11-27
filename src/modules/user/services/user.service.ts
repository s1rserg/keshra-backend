import { Injectable, NotFoundException } from '@nestjs/common';
import type { EntityManager } from 'typeorm';

import { Media, UserAvatarService } from '@modules/media';

import type { FileUpload, Nullable } from '@common/types';
import { DbErrorParser } from '@common/utils/db-error-parser';
import { isNonEmptyArray } from '@common/utils/non-empty-check';
import type { MessageApiResponseDto } from '@common/dto/message-api-response.dto';

import type { User, UserWithAvatar } from '../types';
import type { CreateUserDto } from '../dto/create-user.dto';
import type { GetAllUsersQueryDto } from '../dto/get-all-users-query.dto';
import type { UpdateUserDto } from '../dto/update-user.dto';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAvatarService: UserAvatarService,
  ) {}

  async create(createUserDto: CreateUserDto, manager?: EntityManager): Promise<User> {
    try {
      return await this.userRepository.create(createUserDto, manager);
    } catch (error) {
      const result = DbErrorParser.parse(error, 'User');
      if (!result) throw error;
      throw result.exception;
    }
  }

  async findAll(query: GetAllUsersQueryDto): Promise<UserWithAvatar[]> {
    const users = await this.userRepository.findAll(query);

    const userIds = users.map((u) => u.id);
    if (!isNonEmptyArray(userIds)) return [];

    const avatars = await this.userAvatarService.getAvatarsByUserIds(userIds);

    return users.map((user) => ({
      ...user,
      avatar: avatars[user.id] || null,
    }));
  }

  async findOne(id: number): Promise<UserWithAvatar> {
    const user = await this.userRepository.findOne('id', id);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    const avatar = await this.userAvatarService.findMainAvatar(id);

    return {
      ...user,
      avatar,
    };
  }

  async findOneByEmailOrNull(email: string): Promise<Nullable<User>> {
    return this.userRepository.findOne('email', email);
  }

  async findByUsernameOrNull(username: string): Promise<Nullable<User>> {
    return this.userRepository.findOneByUsername(username);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserWithAvatar> {
    const user = await this.userRepository.update(id, updateUserDto);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    const avatar = await this.userAvatarService.findMainAvatar(user.id);

    return {
      ...user,
      avatar,
    };
  }

  async remove(id: number): Promise<MessageApiResponseDto> {
    const result = await this.userRepository.remove(id);

    if (!result.affected) {
      throw new NotFoundException(`User not found`);
    }

    return { message: `User was successfully deleted` };
  }

  async uploadAvatar(userId: number, file: FileUpload): Promise<Media> {
    return this.userAvatarService.createAvatar(userId, file);
  }

  async getAllUserAvatars(userId: number): Promise<Media[]> {
    return this.userAvatarService.getAllAvatars(userId);
  }

  async setUserMainAvatar(userId: number, mediaId: number): Promise<Media> {
    return this.userAvatarService.setMainAvatar(userId, mediaId);
  }

  async deleteUserAvatar(userId: number, mediaId: number): Promise<MessageApiResponseDto> {
    return this.userAvatarService.deleteAvatar(userId, mediaId);
  }
}
