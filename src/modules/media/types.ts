import { Nullable } from '@common/types';

import type { MediaEntity } from './entities/media.entity';

export enum UserMediaRole {
  AVATAR = 'AVATAR',
}

export type CreateMediaDto = Omit<MediaEntity, 'id' | 'recordCreatedAt' | 'recordUpdatedAt'>;

export type CreateUserMediaDto = {
  userId: number;
  mediaId: number;
  role: UserMediaRole;
  isMain: boolean;
};

export type UpdateUserMediaDto = {
  mediaId?: number;
  isMain?: boolean;
};

export interface Media {
  id: number;
  createdAt: Date;
  width: number;
  height: number;
  secureUrl: string;
}

export interface UserMedia {
  id: number;
  role: UserMediaRole;
  isMain: boolean;
  userId: number;
  mediaId: number;
  media: Nullable<Media>;
  createdAt: Date;
  updatedAt: Date;
}

// Chat media

export enum ChatMediaRole {
  AVATAR = 'AVATAR',
}

export interface ChatMedia {
  id: number;
  role: ChatMediaRole;
  isMain: boolean;
  chatId: number;
  mediaId: number;
  media: Nullable<Media>;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateChatMediaDto = {
  chatId: number;
  mediaId: number;
  role: ChatMediaRole;
  isMain: boolean;
};

export type UpdateChatMediaDto = {
  mediaId?: number;
  isMain?: boolean;
};

//CLOUDINARY

export type CloudinaryUploadResult = CreateMediaDto;

export type CloudinaryError = {
  message: string;
};

export type CloudinaryUploadData = {
  asset_id?: string;
  public_id: string;
  format?: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  folder?: string;
  original_filename?: string;
  secure_url: string;
};

export type CloudinaryDestroyData = {
  result?: string;
};

// GC

export enum MediaGcStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  FAILED = 'FAILED',
}

export interface GcMediaJobData {
  gcMediaId: number;
}
