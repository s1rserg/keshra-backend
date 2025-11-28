import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetPublicChatsQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
