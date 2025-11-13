import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

import type { ChatType } from '@modules/chat';

@Exclude()
export class PublicChatListResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  type: ChatType;

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
