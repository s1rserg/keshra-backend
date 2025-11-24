import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

import { ReactionResponseDto } from '../reaction/reaction-response.dto';

@Exclude()
export class MessageBaseResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  content: string;

  @Expose()
  @ApiProperty()
  segNumber: number;

  @Expose()
  @Type(() => ReactionResponseDto)
  @ApiProperty({ type: ReactionResponseDto, isArray: true })
  reactions: ReactionResponseDto[];

  @Expose()
  @ApiProperty()
  authorId: number;

  @Expose()
  @ApiProperty()
  chatId: number;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
