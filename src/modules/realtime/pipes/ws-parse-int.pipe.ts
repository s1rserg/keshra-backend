import { ParseIntPipe } from '@nestjs/common';

import { WsBadRequestException } from '../exceptions/ws-exceptions';

export const WsParseIntPipe = (key: string) =>
  new ParseIntPipe({
    exceptionFactory: () => new WsBadRequestException(`${key} must be a number`),
  });
