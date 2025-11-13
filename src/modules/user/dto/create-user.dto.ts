import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { IsUsername } from '@common/decorators/is-username.decorator';

import { UserValidationConfig } from '../user-validation.config';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(UserValidationConfig.name.minLength)
  @MaxLength(UserValidationConfig.name.maxLength)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(UserValidationConfig.surname.minLength)
  @MaxLength(UserValidationConfig.surname.maxLength)
  surname?: string;

  @IsUsername()
  username: string;
}
