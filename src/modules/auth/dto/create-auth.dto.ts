import { IsEmail, IsEnum, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

import { AuthProvider, Nullable } from '@common/types';

export class CreateAuthDto {
  @IsEmail()
  @MaxLength(50)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  password?: Nullable<string>;

  @IsNumber()
  userId: number;

  @IsOptional()
  @IsEnum(AuthProvider)
  provider: AuthProvider;
}
