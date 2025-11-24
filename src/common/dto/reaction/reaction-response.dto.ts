import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

import { UserDetailsResponseDto } from '../user/user-details-response.dto';

@Exclude()
export class ReactionResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  emoji: string;

  @Expose()
  @ApiProperty()
  authorId: number;

  @Expose()
  @ApiProperty()
  messageId: number;

  @Expose()
  @Type(() => UserDetailsResponseDto)
  @ApiProperty({ type: UserDetailsResponseDto })
  author: UserDetailsResponseDto;
}
