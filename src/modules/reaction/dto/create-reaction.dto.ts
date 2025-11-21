import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateReactionDto {
  @ApiProperty({ example: '👍' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  emoji: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  messageId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  chatId: number;
}
