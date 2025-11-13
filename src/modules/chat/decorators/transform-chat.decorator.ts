import {
  applyDecorators,
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { plainToInstance } from 'class-transformer';

import { exhaustiveChek } from '@common/utils/exhaustive-check';
import { PrivateChatResponseDto } from '@common/dto/chat/private-chat-response.dto';
import { PublicChatResponseDto } from '@common/dto/chat/public-chat-response.dto';

import type { Chat } from '../types';
import { ChatType } from '../enums/chat-type.enum';

@Injectable()
class TransformChatInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: Chat) => {
        return this.transformChat(data);
      }),
    );
  }

  // ! PRIVATE METHODS
  private transformChat = (item: Chat): PublicChatResponseDto | PrivateChatResponseDto => {
    const type = item.type;

    switch (type) {
      case ChatType.PUBLIC:
        return plainToInstance(PublicChatResponseDto, item);
      case ChatType.DIRECT_MESSAGES:
        return plainToInstance(PrivateChatResponseDto, item);
      default:
        return exhaustiveChek(type);
    }
  };
}

export const TransformChatToInstance = () => {
  return applyDecorators(UseInterceptors(TransformChatInterceptor));
};
