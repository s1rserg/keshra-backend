import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class CreatePrivateChatDto {
  @ApiProperty({ description: 'User ID you selected to chat with' })
  @IsNumber({}, { message: 'Receiver ID must be a number' })
  @Min(1, { message: 'Receiver ID can not be less than 1' })
  receiverId: number;
}
