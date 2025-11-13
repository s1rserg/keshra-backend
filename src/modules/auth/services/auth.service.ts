import { Injectable } from '@nestjs/common';

import { AppJwtService } from '@infrastructure/app-jwt-module';

import type { ActiveUser } from '@common/types';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: AppJwtService) {}

  refreshToken(activeUser: ActiveUser) {
    return this.jwtService.signTokensPair(activeUser);
  }
}
