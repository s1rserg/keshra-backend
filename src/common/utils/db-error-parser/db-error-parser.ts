import { BadRequestException, ConflictException, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { DatabaseError } from 'pg';

import { Nullable, PostgresErrorCode } from '../../types';
import { DbErrorParseResult } from './types';

class DbErrorParserClass {
  parse(error: unknown, entityName?: string): Nullable<DbErrorParseResult> {
    if (!this.isDatabaseError(error)) return null;

    const databaseError = error.driverError;
    if (!databaseError.code) return null;

    const code = databaseError.code as PostgresErrorCode;
    const match = databaseError.detail?.match(/\((.*?)\)=\((.*?)\)/);
    const field = match?.[1];
    if (!field) return null;

    switch (code) {
      case PostgresErrorCode.UNIQUE_VIOLATION:
        return this.handleUniqueViolation(code, field, entityName);
      case PostgresErrorCode.NOT_NULL_VIOLATION:
        return this.handleNotNullViolation(code, field);
      default:
        return null;
    }
  }

  private handleUniqueViolation(
    code: PostgresErrorCode,
    field: string,
    entityName?: string,
  ): DbErrorParseResult {
    const prefix = entityName ? `${entityName} with this ` : '';
    const message = `${prefix}${field} already exists.`;
    const statusCode = HttpStatus.CONFLICT;
    const exception = new ConflictException(message);

    return {
      code,
      field,
      message,
      statusCode,
      exception,
    };
  }

  private handleNotNullViolation(code: PostgresErrorCode, field: string): DbErrorParseResult {
    const message = `${field} is required`;
    const statusCode = HttpStatus.BAD_REQUEST;
    const exception = new BadRequestException(message);

    return {
      code,
      field,
      message,
      statusCode,
      exception,
    };
  }

  private isDatabaseError(error: unknown): error is QueryFailedError<DatabaseError> {
    const isFailedQueryError = error instanceof QueryFailedError;
    if (!isFailedQueryError) return false;

    return error.driverError instanceof DatabaseError;
  }
}

export const DbErrorParser = new DbErrorParserClass();
