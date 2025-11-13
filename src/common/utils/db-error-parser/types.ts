import type { HttpException, HttpStatus } from '@nestjs/common';

import type { PostgresErrorCode } from '../../types';

export interface DbErrorParseResult {
  message: string;
  code: PostgresErrorCode;
  statusCode: HttpStatus;
  field: string;
  exception: HttpException;
}
