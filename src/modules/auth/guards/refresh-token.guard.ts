import { Request } from 'express';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import { AppJwtService } from '@infrastructure/app-jwt-module';

import { Maybe } from '@common/types';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly jwtService: AppJwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpArgumentsHost = context.switchToHttp();
    const request = httpArgumentsHost.getRequest<Request>();

    const token = this.getToken(request);
    if (!token) throw new UnauthorizedException();

    try {
      request.user = await this.jwtService.verify(token);
    } catch (_error) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private getToken(request: Request): Maybe<string> {
    return request.cookies.refresh_token as Maybe<string>;
  }
}
