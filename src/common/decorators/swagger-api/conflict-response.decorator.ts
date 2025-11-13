import { HttpStatus } from '@nestjs/common';
import { ApiConflictResponse } from '@nestjs/swagger';

import { ErrorResponseDto } from '@common/dto/error-response.dto';

export const SwaggerConflictResponse = (
  message = '{field} already exists',
): MethodDecorator & ClassDecorator =>
  ApiConflictResponse({
    type: ErrorResponseDto,
    description: 'Conflict',
    example: {
      message,
      error: 'Conflict',
      statusCode: HttpStatus.CONFLICT,
    } satisfies ErrorResponseDto,
  });
