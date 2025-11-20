import { Injectable } from '@nestjs/common';

import { type Chat, OuterChatService } from '@modules/chat';
import { ChatParticipantService } from '@modules/chat-participant';

import { WsNotFoundException } from '../exceptions/ws-exceptions';
import { MarkChatReadDto } from '../dto/mark-chat-read.dto';

@Injectable()
export class RealtimeChatService {
  constructor(
    private readonly chatService: OuterChatService,
    private readonly chatParticipantService: ChatParticipantService,
  ) {}

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

  async markChatAsRead(userId: number, payload: MarkChatReadDto): Promise<void> {
    const hasAccess = await this.userHasAccessToChat(userId, payload.chatId);
    if (!hasAccess) return;

    await this.chatParticipantService.updateLastRead(userId, payload.chatId, payload.segNumber);
  }
}
