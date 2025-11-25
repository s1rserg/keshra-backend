import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

import { MessageValidationConfig } from '../config/message-validation.config';

const VALIDATION_MESSAGES = {
  content: {
    isString: 'Content must be a string',
    maxLength: `Content must not exceed ${MessageValidationConfig.content.maxLength} characters`,
    notEmpty: 'Content must not be empty',
  },
  chatId: {
    isInt: 'Chat ID must be an integer',
    isPositive: 'Chat ID must be a positive number',
  },
  replyToId: {
    isInt: 'Message reply to ID must be an integer',
    isPositive: 'Message reply to ID must be a positive number',
  },
} as const;

export class CreateMessageDto {
  @ApiProperty({
    minLength: MessageValidationConfig.content.minLength,
    maxLength: MessageValidationConfig.content.maxLength,
    example: 'Hello, world!',
  })
  @IsString({ message: VALIDATION_MESSAGES.content.isString })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.content.notEmpty })
  @MaxLength(MessageValidationConfig.content.maxLength, {
    message: VALIDATION_MESSAGES.content.maxLength,
  })
  content: string;

  @ApiProperty({ example: 1 })
  @IsInt({ message: VALIDATION_MESSAGES.chatId.isInt })
  @IsPositive({ message: VALIDATION_MESSAGES.chatId.isPositive })
  chatId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt({ message: VALIDATION_MESSAGES.replyToId.isInt })
  @IsPositive({ message: VALIDATION_MESSAGES.replyToId.isPositive })
  replyToId?: number;
}
