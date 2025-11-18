import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { TransformPlainToInstance } from 'class-transformer';

import { Media } from '@modules/media';

import type { ActiveUser, FileUpload } from '@common/types';
import { ChatDetailsResponseDto } from '@common/dto/chat/chat-details-response.dto';
import { ChatMediaResponseDto } from '@common/dto/chat/chat-media-response.dto';
import { PrivateChatListResponseDto } from '@common/dto/chat/private-chat-list-response.dto';
import { PrivateChatResponseDto } from '@common/dto/chat/private-chat-response.dto';
import { PublicChatResponseDto } from '@common/dto/chat/public-chat-response.dto';
import { MessageApiResponseDto } from '@common/dto/message-api-response.dto';
import { UserMediaResponseDto } from '@common/dto/user/user-media-response.dto';
import { RequestUser } from '@common/decorators/active-user.decorator';
import { SwaggerNotFoundResponse } from '@common/decorators/swagger-api/not-found-response.decorator';

import type { CreatePrivateChatDto } from './dto/create-private-chat.dto';
import type { CreatePublicChatDto } from './dto/create-public-chat.dto';
import { GetPublicChatsQueryDto } from './dto/get-public-chats-query.dto';
import { UploadAvatarDto } from './dto/upload-avatar-dto';
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

  @Get('/public')
  @ApiOkResponse({
    schema: { $ref: getSchemaPath(PublicChatResponseDto) },
  })
  @TransformChatListToInstance()
  async searchPublicChats(@Query() query: GetPublicChatsQueryDto) {
    return this.chatService.searchPublicChats(query.search);
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

  @Post(':id/join')
  @ApiCreatedResponse({ type: ChatDetailsResponseDto })
  @TransformChatDetailsToInstance()
  async joinPublicChat(@RequestUser() user: ActiveUser, @Param('id', ParseIntPipe) id: number) {
    return this.chatService.joinPublicChat(id, user);
  }

  @Post(':id/avatars')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar file',
    type: UploadAvatarDto,
  })
  @TransformPlainToInstance(ChatMediaResponseDto)
  async uploadAvatar(
    @Param('id', ParseIntPipe) chatId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|png|webp)/ }),
        ],
      }),
    )
    file: FileUpload,
  ): Promise<Media> {
    const fileUpload = {
      buffer: file.buffer,
      originalname: file.originalname,
    };
    return this.chatService.uploadAvatar(chatId, fileUpload);
  }

  @Get(':id/avatars')
  @TransformPlainToInstance(UserMediaResponseDto)
  async getAllAvatars(@Param('id', ParseIntPipe) chatId: number): Promise<Media[]> {
    return this.chatService.getAllAvatars(chatId);
  }

  @Patch(':id/avatars/:mediaId/set-main')
  @SwaggerNotFoundResponse()
  @TransformPlainToInstance(UserMediaResponseDto)
  async setMainAvatar(
    @Param('id', ParseIntPipe) chatId: number,
    @Param('mediaId', ParseIntPipe) mediaId: number,
  ): Promise<Media> {
    return this.chatService.setMainAvatar(chatId, mediaId);
  }

  @Delete(':id/avatars/:mediaId')
  @SwaggerNotFoundResponse()
  async deleteAvatar(
    @Param('id', ParseIntPipe) chatId: number,
    @Param('mediaId', ParseIntPipe) mediaId: number,
  ): Promise<MessageApiResponseDto> {
    return this.chatService.deleteAvatar(chatId, mediaId);
  }
}
