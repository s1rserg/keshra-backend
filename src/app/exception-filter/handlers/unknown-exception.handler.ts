import type { Response } from 'express';
import { type ArgumentsHost, type ExceptionFilter, HttpStatus, Injectable } from '@nestjs/common';

import { ErrorResponseDto } from '@common/dto/error-response.dto';

@Injectable()
export class UnknownExceptionHandler implements ExceptionFilter {
  catch(_exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorResponse: ErrorResponseDto = {
      message: 'Internal Server Error',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Unknown Error',
    };

    response.status(errorResponse.statusCode).json(errorResponse);
  }
}
