import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

import { CursorQueryDto } from '@common/dto/cursor-request.dto';

export class GetMessagesQueryDto extends CursorQueryDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
    { message: 'Chat ID must be a number' },
  )
  chatId: number;
}
