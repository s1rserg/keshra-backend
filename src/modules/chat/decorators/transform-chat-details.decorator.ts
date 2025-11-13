import {
  applyDecorators,
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { map, type Observable } from 'rxjs';
import { plainToInstance } from 'class-transformer';

import { ChatDetailsResponseDto } from '@common/dto/chat/chat-details-response.dto';

import type { Chat } from '../types';

@Injectable()
class TransformChatDetailsInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: Chat) => {
        return plainToInstance(ChatDetailsResponseDto, data);
      }),
    );
  }
}

export const TransformChatDetailsToInstance = () => {
  return applyDecorators(UseInterceptors(TransformChatDetailsInterceptor));
};
