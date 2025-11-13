import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

import { UserResponseDto } from '../user/user-response.dto';
import { MessageBaseResponseDto } from './message-base-response.dto';

@Exclude()
export class MessageWithAuthorResponseDto extends MessageBaseResponseDto {
  @Expose()
  @Type(() => UserResponseDto)
  @ApiProperty({ type: UserResponseDto })
  author: UserResponseDto;
}
