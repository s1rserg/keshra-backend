import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

import type { ChatType } from '@modules/chat';
import type { ChatParticipantWithUser } from '@modules/chat-participant';

@Exclude()
export class ChatDetailsResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  type: ChatType;

  // todo create dto for this
  @ApiProperty()
  @Expose()
  participants: ChatParticipantWithUser[];

  @ApiProperty()
  @Expose()
  updatedAt: string;

  @ApiProperty()
  @Expose()
  createdAt: string;
}
