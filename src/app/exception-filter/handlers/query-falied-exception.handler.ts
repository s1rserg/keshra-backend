import { Response } from 'express';
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  type HttpException,
  Injectable,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

import { DbErrorParser } from '@common/utils/db-error-parser';
import type { ErrorResponseDto } from '@common/dto/error-response.dto';

import { UnknownExceptionHandler } from './unknown-exception.handler';

@Injectable()
@Catch(QueryFailedError)
export class QueryFailedExceptionHandler implements ExceptionFilter<QueryFailedError> {
  constructor(private readonly unknownExceptionHandler: UnknownExceptionHandler) {}

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const result = DbErrorParser.parse(exception);

    if (!result) {
      this.unknownExceptionHandler.catch(exception, host);
      return;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorResponse = this.getErrorResponse(result.exception);

    response.status(result.statusCode).json(errorResponse);
  }

  private getErrorResponse(exception: HttpException): ErrorResponseDto {
    return {
      message: exception.message,
      statusCode: exception.getStatus(),
      error: exception.name,
    };
  }
}
