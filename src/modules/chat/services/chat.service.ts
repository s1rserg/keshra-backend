import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ChatParticipantService } from '@modules/chat-participant';
import { ChatAvatarService, Media } from '@modules/media';

import type { ActiveUser, FileUpload, NonEmptyArray } from '@common/types';
import { MessageApiResponseDto } from '@common/dto/message-api-response.dto';

import {
  ChatDetailsWithAvatar,
  ChatWithAvatar,
  type ChatWithParticipants,
  isPrivateChat,
  type PrivateChat,
  type PublicChat,
  PublicChatWithAvatar,
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
    private readonly chatAvatarService: ChatAvatarService,
  ) {}

  async findUserChats(user: ActiveUser): Promise<ChatWithAvatar[]> {
    const participants = await this.chatParticipantService.findByUserId(user.id);
    const chatIds = participants.map((participant) => participant.chatId);
    const chatArray = await this.chatRepository.findByIds(chatIds);

    if (chatArray.length === 0) return [];

    const avatarsMap = await this.chatAvatarService.getAvatarsByChatIds(
      chatArray.map((c) => c.id) as NonEmptyArray<number>,
    );

    const privateChatsIds = chatArray.filter((chat) => isPrivateChat(chat)).map((chat) => chat.id);
    const titlesMap = await this.chatParticipantService.findPrivateChatsTitle(
      privateChatsIds,
      user.id,
    );

    return chatArray.map((chat) => {
      const avatar = avatarsMap[chat.id] || null;
      if (!isPrivateChat(chat)) {
        return { ...chat, avatar };
      }
      const title = titlesMap[chat.id] || 'User deleted';
      return { ...chat, title, avatar };
    });
  }

  async searchPublicChats(query?: string): Promise<PublicChatWithAvatar[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const chats = await this.chatRepository.searchPublicChatsByTitle(query);

    if (chats.length === 0) {
      return [];
    }

    const chatIds = chats.map((chat) => chat.id);
    const avatarsMap = await this.chatAvatarService.getAvatarsByChatIds(
      chatIds as NonEmptyArray<number>,
    );

    return chats.map((chat) => ({
      ...chat,
      avatar: avatarsMap[chat.id] || null,
    }));
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

  async findById(id: number, user: ActiveUser): Promise<ChatDetailsWithAvatar> {
    const chat = await this.chatRepository.findById(id);
    if (!chat) throw new NotFoundException(`Chat not found`);

    const hasAccess = this.chatAccessService.checkUserAccessToChat(user.id, chat);
    if (!hasAccess) throw new ForbiddenException(`You don't have access to this chat`);

    const chatUsers = await this.chatParticipantService.findChatUsers(chat.id);

    const avatar = await this.chatAvatarService.findMainAvatar(chat.id);

    let chatTitle = chat.title;
    if (isPrivateChat(chat)) {
      const receiver = chatUsers.find(({ id }) => id !== user.id);
      chatTitle = receiver?.user.username || 'User deleted';
    }

    return {
      ...chat,
      participants: chatUsers,
      title: chatTitle!,
      avatar,
    };
  }

  async joinPublicChat(chatId: number, user: ActiveUser): Promise<ChatWithParticipants> {
    const chat = await this.chatRepository.findById(chatId);
    if (!chat) {
      throw new NotFoundException(`Chat not found`);
    }

    if (chat.type !== ChatType.PUBLIC) {
      throw new ForbiddenException('You can only join public chats.');
    }

    const existingParticipant = await this.chatParticipantService.findByChatIdAndUserId(
      chat.id,
      user.id,
    );

    if (existingParticipant) {
      throw new ConflictException('You are already a member of this chat');
    }

    await this.chatParticipantService.create({
      chatId: chat.id,
      userId: user.id,
    });

    return this.findById(chatId, user);
  }

  async uploadAvatar(chatId: number, file: FileUpload): Promise<Media> {
    return this.chatAvatarService.createAvatar(chatId, file);
  }

  async getAllAvatars(chatId: number): Promise<Media[]> {
    return this.chatAvatarService.getAllAvatars(chatId);
  }

  async setMainAvatar(chatId: number, mediaId: number): Promise<Media> {
    return this.chatAvatarService.setMainAvatar(chatId, mediaId);
  }

  async deleteAvatar(chatId: number, mediaId: number): Promise<MessageApiResponseDto> {
    return this.chatAvatarService.deleteAvatar(chatId, mediaId);
  }
}
