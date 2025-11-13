import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { TransformPlainToInstance } from 'class-transformer';

import type { ActiveUser } from '@common/types';
import { MessageApiResponseDto } from '@common/dto/message-api-response.dto';
import { UserDetailsResponseDto } from '@common/dto/user/user-details-response.dto';
import { UserListResponseDto } from '@common/dto/user/user-list-response.dto';
import { UserResponseDto } from '@common/dto/user/user-response.dto';
import { RequestUser } from '@common/decorators/active-user.decorator';
import { SwaggerNotFoundResponse } from '@swagger-decorators/not-found-response.decorator';
import { SwaggerUnauthorizedResponse } from '@swagger-decorators/unauthorized-response.decorator';

import { CreateUserDto } from './dto/create-user.dto';
import { GetAllUsersQueryDto } from './dto/get-all-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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
  @TransformPlainToInstance(UserResponseDto)
  async findMe(@RequestUser() user: ActiveUser): Promise<UserResponseDto> {
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

  @Get(':id')
  @ApiExcludeEndpoint()
  @SwaggerNotFoundResponse()
  @TransformPlainToInstance(UserDetailsResponseDto)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }
}
