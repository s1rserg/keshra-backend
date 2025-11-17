import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

import type { AppExceptionHandlersState } from './types';
import { HttpExceptionHandler } from './handlers/http-exception.handler';
import { QueryFailedExceptionHandler } from './handlers/query-falied-exception.handler';
import { UnknownExceptionHandler } from './handlers/unknown-exception.handler';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private exceptionHandlers: AppExceptionHandlersState[] = [];

  constructor(
    private readonly httpExceptionHandler: HttpExceptionHandler,
    private readonly unknownExceptionHandler: UnknownExceptionHandler,
    private readonly queryFailedExceptionHandler: QueryFailedExceptionHandler,
  ) {
    this.registerHandler(HttpException, this.httpExceptionHandler);
    this.registerHandler(QueryFailedError, this.queryFailedExceptionHandler);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    // eslint-disable-next-line no-console
    console.error(exception);
    const candidate = this.exceptionHandlers.find(({ type }) => exception instanceof type);

    if (candidate) {
      candidate.handler.catch(exception, host);
      return;
    }

    this.unknownExceptionHandler.catch(exception, host);
  }

  private registerHandler(type: unknown, handler: ExceptionFilter) {
    this.exceptionHandlers.push({
      type,
      handler,
    });
  }
}
