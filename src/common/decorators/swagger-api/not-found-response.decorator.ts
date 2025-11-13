import { HttpStatus } from '@nestjs/common';
import { ApiNotFoundResponse } from '@nestjs/swagger';

import { ErrorResponseDto } from '@common/dto/error-response.dto';

export const SwaggerNotFoundResponse = (
  message = '{entity} not found',
): MethodDecorator & ClassDecorator =>
  ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Not Found',
    example: {
      message,
      error: 'Not Found',
      statusCode: HttpStatus.NOT_FOUND,
    } satisfies ErrorResponseDto,
  });
