import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

import type { ActiveUser } from '@common/types';
import { ChatDetailsResponseDto } from '@common/dto/chat/chat-details-response.dto';
import { PrivateChatListResponseDto } from '@common/dto/chat/private-chat-list-response.dto';
import { PrivateChatResponseDto } from '@common/dto/chat/private-chat-response.dto';
import { PublicChatResponseDto } from '@common/dto/chat/public-chat-response.dto';
import { RequestUser } from '@common/decorators/active-user.decorator';

import type { CreatePrivateChatDto } from './dto/create-private-chat.dto';
import type { CreatePublicChatDto } from './dto/create-public-chat.dto';
import { ChatService } from './services/chat.service';
import { TransformChatToInstance } from './decorators/transform-chat.decorator';
import { TransformChatDetailsToInstance } from './decorators/transform-chat-details.decorator';
import { TransformChatListToInstance } from './decorators/transform-chat-list.decorator';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @ApiOkResponse({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(PublicChatResponseDto) },
        { $ref: getSchemaPath(PrivateChatListResponseDto) },
      ],
    },
  })
  @TransformChatListToInstance()
  async findMy(@RequestUser() user: ActiveUser) {
    return this.chatService.findUserChats(user);
  }

  @Post('/public')
  @TransformChatToInstance()
  @ApiCreatedResponse({ type: PublicChatResponseDto })
  async createPublic(
    @RequestUser() user: ActiveUser,
    @Body() createPublicChatDto: CreatePublicChatDto,
  ) {
    return this.chatService.createPublicChat(createPublicChatDto, user);
  }

  @Post('/private')
  @TransformChatToInstance()
  @ApiCreatedResponse({ type: PrivateChatResponseDto })
  async createPrivate(
    @RequestUser() user: ActiveUser,
    @Body() createPrivateChatDto: CreatePrivateChatDto,
  ) {
    return this.chatService.createPrivateChat(createPrivateChatDto, user);
  }

  @Get(':id')
  @ApiOkResponse({
    type: ChatDetailsResponseDto,
  })
  @TransformChatDetailsToInstance()
  async getById(@RequestUser() user: ActiveUser, @Param('id', ParseIntPipe) id: number) {
    return this.chatService.findById(id, user);
  }
}
