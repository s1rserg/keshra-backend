import { Injectable } from '@nestjs/common';

import { type Chat, OuterChatService } from '@modules/chat';

import { WsNotFoundException } from '../exceptions/ws-exceptions';

@Injectable()
export class RealtimeChatService {
  constructor(private readonly chatService: OuterChatService) {}

  async getChatById(chatId: number): Promise<Chat> {
    const chat = await this.chatService.findByIdOrNull(chatId);
    if (!chat) {
      throw new WsNotFoundException('Chat not found');
    }

    return chat;
  }

  async userHasAccessToChat(userId: number, chatId: number): Promise<boolean> {
    const chat = await this.getChatById(chatId);
    return this.chatService.checkUserAccessToChat(userId, chat);
  }
}
