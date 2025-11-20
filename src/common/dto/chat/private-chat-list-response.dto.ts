import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

import type { ChatType } from '@modules/chat';

import { Nullable } from '@common/types';

import { ChatMediaResponseDto } from './chat-media-response.dto';

@Exclude()
export class PrivateChatListResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  type: ChatType;

  @Expose()
  @ApiProperty()
  unreadCount: number;

  @Expose()
  @ApiProperty({ type: ChatMediaResponseDto, nullable: true })
  avatar: Nullable<ChatMediaResponseDto>;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  // message denormalization
  @ApiProperty({ nullable: true })
  @Expose()
  lastMessageAuthor: string;

  @ApiProperty({ nullable: true })
  @Expose()
  lastMessagePreview: string;
}
