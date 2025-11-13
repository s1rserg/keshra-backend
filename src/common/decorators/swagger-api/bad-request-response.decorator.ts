import { HttpStatus } from '@nestjs/common';
import { ApiBadRequestResponse } from '@nestjs/swagger';

import { ErrorResponseDto } from '@common/dto/error-response.dto';

export const SwaggerBadRequestResponse = (
  message = 'email is required',
): MethodDecorator & ClassDecorator =>
  ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Bad Request',
    example: {
      message,
      error: 'Bad Request',
      statusCode: HttpStatus.BAD_REQUEST,
    } satisfies ErrorResponseDto,
  });
