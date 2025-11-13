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

import { exhaustiveChek } from '@common/utils/exhaustive-check';
import { PrivateChatListResponseDto } from '@common/dto/chat/private-chat-list-response.dto';
import { PublicChatListResponseDto } from '@common/dto/chat/public-chat-list-response.dto';

import type { Chat } from '../types';
import { ChatType } from '../enums/chat-type.enum';

@Injectable()
class TransformChatListInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: Chat[]) => {
        return data.map((item) => this.transformChatList(item));
      }),
    );
  }

  // ! PRIVATE METHODS
  private transformChatList = (
    item: Chat,
  ): PublicChatListResponseDto | PrivateChatListResponseDto => {
    const type = item.type;

    switch (type) {
      case ChatType.PUBLIC:
        return plainToInstance(PublicChatListResponseDto, item);
      case ChatType.DIRECT_MESSAGES:
        return plainToInstance(PrivateChatListResponseDto, item);
      default:
        return exhaustiveChek(type);
    }
  };
}

export const TransformChatListToInstance = () => {
  return applyDecorators(UseInterceptors(TransformChatListInterceptor));
};
