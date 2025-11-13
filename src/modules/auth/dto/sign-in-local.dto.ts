import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class SignInLocalDto {
  @ApiProperty({ maxLength: 50 })
  @IsEmail()
  @MaxLength(50)
  email: string;

  @ApiProperty({ maxLength: 50 })
  @IsString()
  @MaxLength(50)
  password: string;
}
