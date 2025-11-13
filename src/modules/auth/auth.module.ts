import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppJwtModule } from '@infrastructure/app-jwt-module';
import { UserModule } from '@modules/user';

import { AccessTokenGuard } from './guards/access-token.guard';
import { AuthEntity } from './entities/auth.entity';
import { AuthService } from './services/auth.service';
import { AuthLocalService } from './services/auth-local.service';
import { AuthRegistrationService } from './services/auth-registration.service';
import { CookiesService } from './services/cookies.service';
import { CryptoService } from './services/crypto.service';
import { AuthRepository } from './repositories/auth.repository';
import { AuthController } from './auth.controller';

@Module({
  imports: [AppJwtModule, TypeOrmModule.forFeature([AuthEntity]), UserModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    CryptoService,
    CookiesService,
    AuthRepository,
    AuthLocalService,
    AuthRegistrationService,
    AuthRepository,
    CryptoService,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
  exports: [AuthLocalService],
})
export class AuthModule {}
