import { ApiProperty } from '@nestjs/swagger';

import type { ErrorResponse } from '../types';

export class ErrorResponseDto implements ErrorResponse {
  @ApiProperty({ description: 'Error message' })
  message: string | string[];

  @ApiProperty({ description: 'Error name' })
  error: string;

  @ApiProperty({ description: 'Error status code', example: 'number' })
  statusCode: number;
}
