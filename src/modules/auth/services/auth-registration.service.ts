import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { UserService } from '@modules/user';

import type { Nullable } from '@common/types';

import type { IAuthRegisterPayload } from '../types';
import type { AuthEntity } from '../entities/auth.entity';
import { CryptoService } from './crypto.service';
import { AuthRepository } from '../repositories/auth.repository';

@Injectable()
export class AuthRegistrationService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly cryptoService: CryptoService,
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
  ) {}

  async registerUser({
    provider,
    email,
    password,
    username,
  }: IAuthRegisterPayload): Promise<AuthEntity> {
    /* TRANSACTION */
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      // Create or get a user record
      let user = await this.userService.findOneByEmailOrNull(email);

      // hash the password
      let hashedPassword: Nullable<string> = null;
      if (password) {
        hashedPassword = await this.cryptoService.hash(password);
      }

      if (!user) {
        user = await this.userService.create({ email, username }, manager);
      }

      // create an auth record
      const auth = await this.authRepository.create(
        {
          userId: user.id,
          email: user.email,
          password: hashedPassword,
          provider,
        },
        manager,
      );
      await queryRunner.commitTransaction();

      return auth;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
