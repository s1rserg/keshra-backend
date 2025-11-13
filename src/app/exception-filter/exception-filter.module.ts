import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { AllExceptionsFilter } from './all-exceptions.filter';
import { HttpExceptionHandler } from './handlers/http-exception.handler';
import { QueryFailedExceptionHandler } from './handlers/query-falied-exception.handler';
import { UnknownExceptionHandler } from './handlers/unknown-exception.handler';

@Module({
  providers: [
    HttpExceptionHandler,
    UnknownExceptionHandler,
    QueryFailedExceptionHandler,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class ExceptionFilterModule {}
