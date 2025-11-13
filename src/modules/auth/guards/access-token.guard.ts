import { Request } from 'express';
import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AppJwtService } from '@infrastructure/app-jwt-module';

import { Maybe } from '@common/types';

import { Public } from '../decorators/public.decorator';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: AppJwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpArgumentsHost = context.switchToHttp();
    const request = httpArgumentsHost.getRequest<Request>();

    const isPublic = this.reflector.getAllAndOverride(Public, [
      context.getClass(),
      context.getHandler(),
    ]);
    if (isPublic) return true;

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
    const [_, token] = request.headers.authorization?.split(' ') || [];
    return token;
  }
}
