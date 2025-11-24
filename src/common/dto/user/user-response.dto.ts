import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

import type { Nullable } from '../../types';
import { UserMediaResponseDto } from './user-media-response.dto';

@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty({ type: 'string', nullable: true })
  name: Nullable<string>;

  @Expose()
  @ApiProperty({ type: 'string', nullable: true })
  surname: Nullable<string>;

  @Expose()
  @ApiProperty({ type: 'string', nullable: true })
  username: string;

  @Expose()
  @ApiProperty({ type: UserMediaResponseDto, nullable: true })
  avatar?: Nullable<UserMediaResponseDto>;
}
