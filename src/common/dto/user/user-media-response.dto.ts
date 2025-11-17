import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserMediaResponseDto {
  @Expose()
  @ApiProperty({ example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ example: 800, type: Number })
  width: number;

  @Expose()
  @ApiProperty({ example: 600, type: Number })
  height: number;

  @Expose()
  @ApiProperty({ example: 'https://...' })
  secureUrl: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}
