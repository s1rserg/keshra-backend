import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetAllUsersQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  perPage?: number;

  @IsOptional()
  @Transform(({ value }) => {
    // ?ids=1,2,3 → [1,2,3]
    if (!value) return undefined;

    const isArray = Array.isArray(value);
    const isString = typeof value === 'string';

    if (!isArray && !isString) return null;
    if (isArray && !value.length) return null;

    let arrayToCast: unknown[] = [];
    if (isArray) arrayToCast = value;
    if (isString) arrayToCast = value.split(',').filter((id) => id !== '');
    if (!arrayToCast.length) return null;

    return arrayToCast.map((id) => Number.parseInt(id as string, 10));
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[];
}
