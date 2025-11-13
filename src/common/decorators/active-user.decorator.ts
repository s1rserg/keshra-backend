import type { Request } from 'express';
import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { ActiveUser } from '@common/types';

import type { Maybe } from '../types';

export const RequestUser = createParamDecorator<unknown, Maybe<ActiveUser>>(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  },
);
