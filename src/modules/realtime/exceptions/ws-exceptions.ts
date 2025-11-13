import { WsException } from '@nestjs/websockets';

import type { ErrorResponse } from '@common/types';

class AppWsException extends WsException {
  constructor(error: ErrorResponse) {
    super(error);
  }

  toJSON(): ErrorResponse {
    return this.getError() as ErrorResponse;
  }
}

export class WsUnauthorizedException extends AppWsException {
  constructor(message: string | string[] = 'Unauthorized') {
    super({ message, statusCode: 401, error: 'Unauthorized' });
  }
}

export class WsBadRequestException extends AppWsException {
  constructor(message: string | string[] = 'Bad Request') {
    super({ message, statusCode: 400, error: 'Bad Request' });
  }
}

export class WsNotFoundException extends AppWsException {
  constructor(message: string | string[] = 'Not Found') {
    super({ message, statusCode: 404, error: 'Not Found' });
  }
}

export class WsForbiddenException extends AppWsException {
  constructor(message: string | string[] = 'Forbidden') {
    super({ message, statusCode: 403, error: 'Forbidden' });
  }
}
