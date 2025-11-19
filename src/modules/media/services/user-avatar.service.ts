import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { FileUpload, NonEmptyArray } from '@common/types';
import { Nullable } from '@common/types';
import { MessageApiResponseDto } from '@common/dto/message-api-response.dto';

import { type Media, UserMedia, UserMediaRole } from '../types';
import { CloudinaryService } from './cloudinary.service';
import { MediaRepository } from '../repositories/media.repository';
import { UserMediaRepository } from '../repositories/user-media.repository';

@Injectable()
export class UserAvatarService {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly userMediaRepository: UserMediaRepository,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(DataSource) private readonly dataSource: DataSource,
  ) {}

  async createAvatar(userId: number, file: FileUpload): Promise<Media> {
    return this.dataSource.transaction(async (manager) => {
      const uploadResult = await this.cloudinaryService.upload(file, 'avatars');

      const media = await this.mediaRepository.create(uploadResult, manager);

      const currentMainLink = await this.userMediaRepository.findMainByUserAndRole(
        userId,
        UserMediaRole.AVATAR,
        manager,
      );

      if (currentMainLink) {
        await this.userMediaRepository.update(currentMainLink.id, { isMain: false }, manager);
      }

      await this.userMediaRepository.create(
        {
          userId,
          mediaId: media.id,
          role: UserMediaRole.AVATAR,
          isMain: true,
        },
        manager,
      );

      return media;
    });
  }

  async findMainAvatar(userId: number): Promise<Nullable<Media>> {
    const avatarLink = await this.userMediaRepository.findMainWithMediaByUserAndRole(
      userId,
      UserMediaRole.AVATAR,
    );
    return avatarLink ? avatarLink.media : null;
  }

  async getAllAvatars(userId: number): Promise<Media[]> {
    const avatarLinks = await this.userMediaRepository.findAllWithMediaByUserAndRole(
      userId,
      UserMediaRole.AVATAR,
    );
    return avatarLinks.map((link) => link.media!);
  }

  async getAvatarsByUserIds(userIds: NonEmptyArray<number>): Promise<Record<number, Media>> {
    const userMedias = await this.userMediaRepository.findAllMainByUserIds(
      userIds,
      UserMediaRole.AVATAR,
    );

    const avatarMap: Record<number, Media> = {};

    userMedias.forEach((um) => {
      if (um.media) {
        avatarMap[um.userId] = um.media;
      }
    });

    return avatarMap;
  }

  async setMainAvatar(userId: number, mediaIdToMakeMain: number): Promise<Media> {
    return this.dataSource.transaction(async (manager) => {
      const targetLink = await this.userMediaRepository.findOneWithMediaByUserMediaAndRole(
        userId,
        mediaIdToMakeMain,
        UserMediaRole.AVATAR,
        manager,
      );

      if (!targetLink) {
        throw new NotFoundException(
          `Avatar with mediaId ${mediaIdToMakeMain} not found for this user`,
        );
      }

      const currentMainLink = await this.userMediaRepository.findMainByUserAndRole(
        userId,
        UserMediaRole.AVATAR,
        manager,
      );

      if (currentMainLink && currentMainLink.id !== targetLink.id) {
        await this.userMediaRepository.update(currentMainLink.id, { isMain: false }, manager);
      }

      await this.userMediaRepository.update(targetLink.id, { isMain: true }, manager);

      return targetLink.media!;
    });
  }

  async deleteAvatar(userId: number, mediaIdToDelete: number): Promise<MessageApiResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const targetLink = await this.userMediaRepository.findOneWithMediaByUserMediaAndRole(
        userId,
        mediaIdToDelete,
        UserMediaRole.AVATAR,
        manager,
      );

      if (!targetLink) {
        throw new NotFoundException(
          `Avatar with mediaId ${mediaIdToDelete} not found for this user`,
        );
      }

      let newMainLink: Nullable<UserMedia> = null;
      if (targetLink.isMain) {
        const allLinks = await this.userMediaRepository.findAllByUserAndRole(
          userId,
          UserMediaRole.AVATAR,
          manager,
        );
        const otherLinks = allLinks.filter((link) => link.mediaId !== mediaIdToDelete);

        if (otherLinks.length > 0 && otherLinks[0]) {
          otherLinks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          newMainLink = otherLinks[0];
        }
      }

      await this.userMediaRepository.delete(targetLink.id, manager);

      if (newMainLink) {
        await this.userMediaRepository.update(newMainLink.id, { isMain: true }, manager);
      }

      return { message: 'Avatar deleted successfully' };
    });
  }
}
