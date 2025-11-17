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
import { ApiBody, ApiConsumes, ApiExcludeEndpoint } from '@nestjs/swagger';
import { TransformPlainToInstance } from 'class-transformer';

import { Media } from '@modules/media';

import type { ActiveUser, FileUpload } from '@common/types';
import { MessageApiResponseDto } from '@common/dto/message-api-response.dto';
import { UserDetailsResponseDto } from '@common/dto/user/user-details-response.dto';
import { UserListResponseDto } from '@common/dto/user/user-list-response.dto';
import { UserMediaResponseDto } from '@common/dto/user/user-media-response.dto';
import { UserResponseDto } from '@common/dto/user/user-response.dto';
import { RequestUser } from '@common/decorators/active-user.decorator';
import { SwaggerNotFoundResponse } from '@swagger-decorators/not-found-response.decorator';
import { SwaggerUnauthorizedResponse } from '@swagger-decorators/unauthorized-response.decorator';

import { CreateUserDto } from './dto/create-user.dto';
import { GetAllUsersQueryDto } from './dto/get-all-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UploadAvatarDto } from './dto/upload-avatar-dto';
import { UserService } from './services/user.service';

@Controller('users')
@SwaggerUnauthorizedResponse()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiExcludeEndpoint()
  @TransformPlainToInstance(UserResponseDto)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiExcludeEndpoint()
  @TransformPlainToInstance(UserResponseDto)
  async findAll(@Query() query: GetAllUsersQueryDto): Promise<UserListResponseDto[]> {
    return this.userService.findAll(query);
  }

  @Get('me')
  @ApiExcludeEndpoint()
  @SwaggerNotFoundResponse()
  @TransformPlainToInstance(UserDetailsResponseDto)
  async findMe(@RequestUser() user: ActiveUser): Promise<UserDetailsResponseDto> {
    return this.userService.findOne(user.id);
  }

  @Patch('me')
  @ApiExcludeEndpoint()
  @SwaggerNotFoundResponse()
  @TransformPlainToInstance(UserResponseDto)
  async updateMe(
    @RequestUser() user: ActiveUser,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(user.id, updateUserDto);
  }

  @Delete('me')
  @ApiExcludeEndpoint()
  @SwaggerNotFoundResponse()
  async remove(@RequestUser() user: ActiveUser): Promise<MessageApiResponseDto> {
    return this.userService.remove(user.id);
  }

  @Post('me/avatars')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar file',
    type: UploadAvatarDto,
  })
  @TransformPlainToInstance(UserMediaResponseDto)
  async uploadAvatar(
    @RequestUser() user: ActiveUser,
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
    return this.userService.uploadAvatar(user.id, fileUpload);
  }

  @Get('me/avatars')
  @TransformPlainToInstance(UserMediaResponseDto)
  async getAllAvatars(@RequestUser() user: ActiveUser): Promise<Media[]> {
    return this.userService.getAllUserAvatars(user.id);
  }

  @Patch('me/avatars/:mediaId/set-main')
  @SwaggerNotFoundResponse()
  @TransformPlainToInstance(UserMediaResponseDto)
  async setMainAvatar(
    @RequestUser() user: ActiveUser,
    @Param('mediaId', ParseIntPipe) mediaId: number,
  ): Promise<Media> {
    return this.userService.setUserMainAvatar(user.id, mediaId);
  }

  @Delete('me/avatars/:mediaId')
  @SwaggerNotFoundResponse()
  async deleteAvatar(
    @RequestUser() user: ActiveUser,
    @Param('mediaId', ParseIntPipe) mediaId: number,
  ): Promise<MessageApiResponseDto> {
    return this.userService.deleteUserAvatar(user.id, mediaId);
  }

  @Get(':id')
  @ApiExcludeEndpoint()
  @SwaggerNotFoundResponse()
  @TransformPlainToInstance(UserDetailsResponseDto)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }
}
