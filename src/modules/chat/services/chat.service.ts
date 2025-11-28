import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ChatParticipant, ChatParticipantService } from '@modules/chat-participant';
import { ChatAvatarService, Media, UserAvatarService } from '@modules/media';

import type { ActiveUser, FileUpload, NonEmptyArray, Nullable } from '@common/types';
import { MessageApiResponseDto } from '@common/dto/message-api-response.dto';

import {
  ChatDetailsWithAvatar,
  type ChatWithParticipants,
  isPrivateChat,
  type PrivateChat,
  type PublicChat,
  PublicChatWithAvatar,
  UserChat,
} from '../types';
import { ChatType } from '../enums/chat-type.enum';
import type { CreatePrivateChatDto } from '../dto/create-private-chat.dto';
import type { CreatePublicChatDto } from '../dto/create-public-chat.dto';
import { ChatAccessService } from './chat-access.service';
import { ChatPresenceService } from './chat-presence.service';
import { ChatRepository } from '../repositories/chat.repository';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly chatParticipantService: ChatParticipantService,
    private readonly chatAccessService: ChatAccessService,
    private readonly chatAvatarService: ChatAvatarService,
    private readonly userAvatarService: UserAvatarService,
    private readonly presenceService: ChatPresenceService,
  ) {}

  async findUserChats(user: ActiveUser): Promise<UserChat[]> {
    const participants = await this.chatParticipantService.findByUserId(user.id);
    const chatIds = participants.map((participant) => participant.chatId);
    const chatArray = await this.chatRepository.findByIds(chatIds);

    if (chatArray.length === 0) return [];

    const publicChatIds = chatArray.filter((c) => !isPrivateChat(c)).map((c) => c.id);

    let chatAvatarsMap: Record<number, Media> = {};
    if (publicChatIds.length > 0) {
      chatAvatarsMap = await this.chatAvatarService.getAvatarsByChatIds(
        publicChatIds as NonEmptyArray<number>,
      );
    }

    const privateChatsIds = chatArray.filter((chat) => isPrivateChat(chat)).map((chat) => chat.id);

    let privateChatDetails: Record<number, { title: string; userId: number }> = {};
    let userAvatarsMap: Record<number, Media> = {};

    if (privateChatsIds.length > 0) {
      privateChatDetails = await this.chatParticipantService.findPrivateChatsTitle(
        privateChatsIds,
        user.id,
      );

      const partnerUserIds = Object.values(privateChatDetails).map((d) => d.userId);

      if (partnerUserIds.length > 0) {
        await this.presenceService.refreshFriendsCache(user.id, partnerUserIds);

        userAvatarsMap = await this.userAvatarService.getAvatarsByUserIds(
          partnerUserIds as NonEmptyArray<number>,
        );
      }
    }

    const participantMap: Record<number, ChatParticipant> = {};
    for (const p of participants) {
      participantMap[p.chatId] = p;
    }

    return chatArray.map((chat) => {
      const participant = participantMap[chat.id];
      const unreadCount = participant
        ? Math.max(chat.lastSegNumber - (participant.lastReadSegNumber || 0), 0)
        : 0;

      if (!isPrivateChat(chat)) {
        return { ...chat, avatar: chatAvatarsMap[chat.id] || null, unreadCount };
      }

      const details = privateChatDetails[chat.id];
      const title = details?.title || 'User deleted';

      const avatar = details ? userAvatarsMap[details.userId] || null : null;

      return { ...chat, title, avatar, unreadCount, partnerUserId: details!.userId };
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
    if (existing) {
      return {
        ...existing,
        title: await this.getPrivateChatTitle(existing.id, user.id),
      };
    }

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

    await this.presenceService.addFriendToCache(user.id, receiverId);

    return {
      ...createdPrivateChat,
      title: await this.getPrivateChatTitle(createdPrivateChat.id, user.id),
    };
  }

  async findById(id: number, user: ActiveUser): Promise<ChatDetailsWithAvatar> {
    const chat = await this.chatRepository.findById(id);
    if (!chat) throw new NotFoundException(`Chat not found`);

    const hasAccess = this.chatAccessService.checkUserAccessToChat(user.id, chat);
    if (!hasAccess) throw new ForbiddenException(`You don't have access to this chat`);

    const chatUsers = await this.chatParticipantService.findChatUsers(chat.id);

    const userIds = chatUsers.map((p) => p.user.id);
    let userAvatarsMap: Record<number, Media> = {};

    if (userIds.length > 0) {
      userAvatarsMap = await this.userAvatarService.getAvatarsByUserIds(
        userIds as NonEmptyArray<number>,
      );
    }

    const participantsWithAvatars = chatUsers.map((p) => ({
      ...p,
      user: {
        ...p.user,
        avatar: userAvatarsMap[p.user.id] || null,
      },
    }));

    let avatar: Nullable<Media> = null;
    let chatTitle = chat.title;

    if (isPrivateChat(chat)) {
      const receiver = chatUsers.find((cu) => cu.user.id !== user.id);
      chatTitle = receiver?.user.username || 'User deleted';

      if (receiver) {
        avatar = userAvatarsMap[receiver.user.id] || null;
      }
    } else {
      avatar = await this.chatAvatarService.findMainAvatar(chat.id);
    }

    return {
      ...chat,
      participants: participantsWithAvatars,
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

  private async getPrivateChatTitle(chatId: number, currentUserId: number): Promise<string> {
    const participants = await this.chatParticipantService.findChatUsers(chatId);
    const receiver = participants.find((p) => p.user.id !== currentUserId);
    return receiver?.user.username || 'User deleted';
  }
}
