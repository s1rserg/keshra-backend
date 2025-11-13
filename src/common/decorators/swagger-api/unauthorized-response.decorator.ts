import { HttpStatus } from '@nestjs/common';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';

import { ErrorResponseDto } from '@common/dto/error-response.dto';

const example: ErrorResponseDto = {
  message: 'Unauthorized',
  error: 'Unauthorized',
  statusCode: HttpStatus.UNAUTHORIZED,
};

export const SwaggerUnauthorizedResponse = (): MethodDecorator & ClassDecorator =>
  ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    example,
    description: 'Unauthorized',
  });
