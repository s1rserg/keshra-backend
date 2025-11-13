import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import type { ActiveUser } from '@common/types';

import type { TokensPair } from './types';
import { jwtConfiguration } from './configs/jwt.config';
import { activeUserValidator } from './utils/active-user.validator';

@Injectable()
export class AppJwtService {
  constructor(
    @Inject(jwtConfiguration.KEY)
    private jwtConfig: ConfigType<typeof jwtConfiguration>,
    private readonly nestJwtService: JwtService,
  ) {}

  signAccessToken(payload: ActiveUser): string {
    return this.nestJwtService.sign(payload, {
      expiresIn: this.jwtConfig.accessTokenTtl,
    });
  }

  signRefreshToken(payload: ActiveUser): string {
    return this.nestJwtService.sign(payload, {
      expiresIn: this.jwtConfig.refreshTokenTtl,
    });
  }

  signTokensPair(payload: ActiveUser): TokensPair {
    const accessToken = this.signAccessToken(payload);
    const refreshToken = this.signRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  async verify(token: string): Promise<ActiveUser> {
    try {
      const decoded = await this.nestJwtService.verifyAsync<ActiveUser>(token);

      return await activeUserValidator(decoded);
    } catch (_err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
