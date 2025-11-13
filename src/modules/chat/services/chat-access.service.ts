import { Injectable } from '@nestjs/common';

import { type Chat, isPublicChat } from '../types';

@Injectable()
export class ChatAccessService {
  checkUserAccessToChat(userId: number, chat: Chat): boolean {
    if (isPublicChat(chat)) return true;

    const dmChatUsers = chat.dmKey?.split(':');

    return dmChatUsers?.some((id) => userId === +id) ?? false;
  }
}
