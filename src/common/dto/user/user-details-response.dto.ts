import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

import type { Nullable } from '../../types';

@Exclude()
export class UserDetailsResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty({ type: 'string', nullable: true })
  name: Nullable<string>;

  @Expose()
  @ApiProperty({ type: 'string', nullable: true })
  surname: Nullable<string>;

  @Expose()
  @ApiProperty({ type: 'string', nullable: true })
  username: string;
}
