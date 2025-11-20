import { IsNumber } from 'class-validator';

export class MarkChatReadDto {
  @IsNumber()
  chatId: number;

  @IsNumber()
  segNumber: number;
}
