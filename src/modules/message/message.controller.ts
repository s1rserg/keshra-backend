import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { TransformPlainToInstance } from 'class-transformer';

import type { ActiveUser } from '@common/types';
import { MessageBaseResponseDto } from '@common/dto/message/message-base-response.dto';
import { MessageWithAuthorResponseDto } from '@common/dto/message/message-with-author-response.dto';
import { RequestUser } from '@common/decorators/active-user.decorator';
import { SwaggerBadRequestResponse } from '@swagger-decorators/bad-request-response.decorator';
import { SwaggerConflictResponse } from '@swagger-decorators/conflict-response.decorator';
import { SwaggerUnauthorizedResponse } from '@swagger-decorators/unauthorized-response.decorator';

import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto';
import { MessageService } from './services/message.service';

@SwaggerUnauthorizedResponse()
@SwaggerBadRequestResponse('Something is not valid')
@SwaggerConflictResponse('You do not have access to this chat')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiOkResponse({ type: MessageBaseResponseDto })
  @TransformPlainToInstance(MessageBaseResponseDto)
  async create(
    @RequestUser() user: ActiveUser,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<MessageBaseResponseDto> {
    return this.messageService.create(createMessageDto, user.id);
  }

  @Get()
  @ApiOkResponse({ type: MessageWithAuthorResponseDto, isArray: true })
  @TransformPlainToInstance(MessageWithAuthorResponseDto)
  async findAll(
    @RequestUser() user: ActiveUser,
    @Query() query: GetMessagesQueryDto,
  ): Promise<MessageWithAuthorResponseDto[]> {
    return this.messageService.findAllByChatId(query, user.id);
  }
}
