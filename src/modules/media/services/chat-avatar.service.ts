import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { FileUpload, NonEmptyArray } from '@common/types';
import { Nullable } from '@common/types';
import { MessageApiResponseDto } from '@common/dto/message-api-response.dto';

import { ChatMedia, ChatMediaRole, type Media } from '../types';
import { CloudinaryService } from './cloudinary.service';
import { ChatMediaRepository } from '../repositories/chat-media.repository';
import { MediaRepository } from '../repositories/media.repository';

@Injectable()
export class ChatAvatarService {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly chatMediaRepository: ChatMediaRepository,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(DataSource) private readonly dataSource: DataSource,
  ) {}

  async createAvatar(chatId: number, file: FileUpload): Promise<Media> {
    return this.dataSource.transaction(async (manager) => {
      const uploadResult = await this.cloudinaryService.upload(file, 'avatars');

      const media = await this.mediaRepository.create(uploadResult, manager);

      const currentMainLink = await this.chatMediaRepository.findMainByChatAndRole(
        chatId,
        ChatMediaRole.AVATAR,
        manager,
      );

      if (currentMainLink) {
        await this.chatMediaRepository.update(currentMainLink.id, { isMain: false }, manager);
      }

      await this.chatMediaRepository.create(
        {
          chatId,
          mediaId: media.id,
          role: ChatMediaRole.AVATAR,
          isMain: true,
        },
        manager,
      );

      return media;
    });
  }

  async findMainAvatar(chatId: number): Promise<Nullable<Media>> {
    const avatarLink = await this.chatMediaRepository.findMainWithMediaByChatAndRole(
      chatId,
      ChatMediaRole.AVATAR,
    );
    return avatarLink ? avatarLink.media : null;
  }

  async getAllAvatars(chatId: number): Promise<Media[]> {
    const avatarLinks = await this.chatMediaRepository.findAllWithMediaByChatAndRole(
      chatId,
      ChatMediaRole.AVATAR,
    );
    return avatarLinks.map((link) => link.media!);
  }

  async getAvatarsByChatIds(chatIds: NonEmptyArray<number>): Promise<Record<number, Media>> {
    const chatMedias = await this.chatMediaRepository.findAllMainByChatIds(
      chatIds,
      ChatMediaRole.AVATAR,
    );

    const avatarMap: Record<number, Media> = {};

    chatMedias.forEach((cm) => {
      if (cm.media) {
        avatarMap[cm.chatId] = cm.media;
      }
    });

    return avatarMap;
  }

  async setMainAvatar(chatId: number, mediaIdToMakeMain: number): Promise<Media> {
    return this.dataSource.transaction(async (manager) => {
      const targetLink = await this.chatMediaRepository.findOneWithMediaByChatMediaAndRole(
        chatId,
        mediaIdToMakeMain,
        ChatMediaRole.AVATAR,
        manager,
      );

      if (!targetLink) {
        throw new NotFoundException(
          `Avatar with mediaId ${mediaIdToMakeMain} not found for this chat`,
        );
      }

      const currentMainLink = await this.chatMediaRepository.findMainByChatAndRole(
        chatId,
        ChatMediaRole.AVATAR,
        manager,
      );

      if (currentMainLink && currentMainLink.id !== targetLink.id) {
        await this.chatMediaRepository.update(currentMainLink.id, { isMain: false }, manager);
      }

      await this.chatMediaRepository.update(targetLink.id, { isMain: true }, manager);

      return targetLink.media!;
    });
  }

  async deleteAvatar(chatId: number, mediaIdToDelete: number): Promise<MessageApiResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const targetLink = await this.chatMediaRepository.findOneWithMediaByChatMediaAndRole(
        chatId,
        mediaIdToDelete,
        ChatMediaRole.AVATAR,
        manager,
      );

      if (!targetLink) {
        throw new NotFoundException(
          `Avatar with mediaId ${mediaIdToDelete} not found for this chat`,
        );
      }

      let newMainLink: Nullable<ChatMedia> = null;
      if (targetLink.isMain) {
        const allLinks = await this.chatMediaRepository.findAllByChatAndRole(
          chatId,
          ChatMediaRole.AVATAR,
          manager,
        );
        const otherLinks = allLinks.filter((link) => link.mediaId !== mediaIdToDelete);

        if (otherLinks.length > 0 && otherLinks[0]) {
          otherLinks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          newMainLink = otherLinks[0];
        }
      }

      await this.chatMediaRepository.delete(targetLink.id, manager);

      if (newMainLink) {
        await this.chatMediaRepository.update(newMainLink.id, { isMain: true }, manager);
      }

      return { message: 'Avatar deleted successfully' };
    });
  }
}
