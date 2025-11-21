import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RedisModule } from '@infrastructure/redis';
import { MediaModule } from '@modules/media';

import { UserEntity } from './entities/user.entity';
import { UserService } from './services/user.service';
import { UserPresenceService } from './services/user-presence.service';
import { UserRepository } from './repositories/user.repository';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), MediaModule, RedisModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserPresenceService],
  exports: [UserService],
})
export class UserModule {}
