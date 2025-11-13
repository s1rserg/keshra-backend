import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ChatParticipantService } from '@modules/chat-participant';

import type { ActiveUser } from '@common/types';

import {
  type Chat,
  type ChatWithParticipants,
  isPrivateChat,
  type PrivateChat,
  type PublicChat,
} from '../types';
import { ChatType } from '../enums/chat-type.enum';
import type { CreatePrivateChatDto } from '../dto/create-private-chat.dto';
import type { CreatePublicChatDto } from '../dto/create-public-chat.dto';
import { ChatAccessService } from './chat-access.service';
import { ChatRepository } from '../repositories/chat.repository';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly chatParticipantService: ChatParticipantService,
    private readonly chatAccessService: ChatAccessService,
  ) {}

  async findUserChats(user: ActiveUser): Promise<Chat[]> {
    const participants = await this.chatParticipantService.findByUserId(user.id);
    const chatIds = participants.map((participant) => participant.chatId);
    const chatArray = await this.chatRepository.findByIds(chatIds);

    const privateChatsIds = chatArray.filter((chat) => isPrivateChat(chat)).map((chat) => chat.id);
    const titlesMap = await this.chatParticipantService.findPrivateChatsTitle(
      privateChatsIds,
      user.id,
    );

    return chatArray.map((chat) => {
      if (!isPrivateChat(chat)) return chat;
      const title = titlesMap[chat.id] || 'User deleted';
      return { ...chat, title };
    });
  }

  async createPublicChat(
    createPublicChatDto: CreatePublicChatDto,
    user: ActiveUser,
  ): Promise<PublicChat> {
    const existing = await this.chatRepository.findByTitle(createPublicChatDto.title);
    if (existing) throw new ConflictException('Chat with this title already exists');

    const createdChat = await this.chatRepository.createPublicChat({
      ...createPublicChatDto,
      type: ChatType.PUBLIC,
    });

    void this.chatParticipantService.create({
      chatId: createdChat.id,
      userId: user.id,
    });

    return createdChat;
  }

  async createPrivateChat(
    createPrivateChatDto: CreatePrivateChatDto,
    user: ActiveUser,
  ): Promise<PrivateChat> {
    const { receiverId } = createPrivateChatDto;

    // check if the user is trying to create a chat with himself
    if (user.id === receiverId) {
      throw new ConflictException('You cannot create a chat with yourself');
    }

    const minUserId = Math.min(user.id, receiverId);
    const maxUserId = Math.max(user.id, receiverId);
    const dmKey = `${ChatType.DIRECT_MESSAGES}:${minUserId}:${maxUserId}`;

    // try to find existing
    const existing = await this.chatRepository.findByDmKey(dmKey);
    if (existing) return existing;

    // create chat
    const createdPrivateChat = await this.chatRepository.createPrivateChat({
      title: null,
      type: ChatType.DIRECT_MESSAGES,
      dmKey,
    });

    // create participants
    await Promise.all(
      [minUserId, maxUserId].map(async (userId) => {
        return this.chatParticipantService.create({
          chatId: createdPrivateChat.id,
          userId,
        });
      }),
    );

    return createdPrivateChat;
  }

  async findById(id: number, user: ActiveUser): Promise<ChatWithParticipants> {
    const chat = await this.chatRepository.findById(id);
    if (!chat) throw new NotFoundException(`Chat not found`);

    const hasAccess = this.chatAccessService.checkUserAccessToChat(user.id, chat);
    if (!hasAccess) throw new ForbiddenException(`You don't have access to this chat`);

    const chatUsers = await this.chatParticipantService.findChatUsers(chat.id);
    let chatTitle = chat.title;
    if (isPrivateChat(chat)) {
      const receiver = chatUsers.find(({ id }) => id !== user.id);
      chatTitle = receiver?.user.username || 'User deleted';
    }

    return { ...chat, participants: chatUsers, title: chatTitle! };
  }
}
