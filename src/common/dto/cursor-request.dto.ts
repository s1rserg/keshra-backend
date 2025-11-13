import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

import { CursorDirection } from '../types';

/**
 * cursor — Open-free token (BASE64/UUID, etc.), the format is determined by a layer of service.
 */
export class CursorQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsEnum(CursorDirection)
  direction: CursorDirection = CursorDirection.NEWER;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 50;
}
