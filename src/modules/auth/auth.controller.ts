import type { Response } from 'express';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';

import type { ActiveUser } from '@common/types';
import { MessageApiResponseDto } from '@common/dto/message-api-response.dto';
import { RequestUser } from '@common/decorators/active-user.decorator';
import { SwaggerBadRequestResponse } from '@swagger-decorators/bad-request-response.decorator';
import { SwaggerConflictResponse } from '@swagger-decorators/conflict-response.decorator';
import { SwaggerNotFoundResponse } from '@swagger-decorators/not-found-response.decorator';
import { SwaggerUnauthorizedResponse } from '@swagger-decorators/unauthorized-response.decorator';

import { SignInLocalDto } from './dto/sign-in-local.dto';
import { SignUpLocalDto } from './dto/sign-up-local.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AuthService } from './services/auth.service';
import { AuthLocalService } from './services/auth-local.service';
import { CookiesService } from './services/cookies.service';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookiesService: CookiesService,
    private readonly authLocalService: AuthLocalService,
  ) {}

  @Post('sign-up')
  @Public()
  @SwaggerBadRequestResponse('Email is required')
  @SwaggerConflictResponse('User with this email already exists')
  async signUp(
    @Res({ passthrough: true }) res: Response,
    @Body() signUpDto: SignUpLocalDto,
  ): Promise<TokenResponseDto> {
    const tokens = await this.authLocalService.signUp(signUpDto);
    const { accessToken, refreshToken } = tokens;

    this.cookiesService.setRefreshTokenCookie(res, refreshToken);

    return { accessToken };
  }

  @Post('sign-in')
  @Public()
  @HttpCode(HttpStatus.OK)
  @SwaggerNotFoundResponse('User not found')
  @SwaggerBadRequestResponse('Password is wrong')
  async signIn(
    @Res({ passthrough: true }) res: Response,
    @Body() signInDto: SignInLocalDto,
  ): Promise<TokenResponseDto> {
    const tokens = await this.authLocalService.signIn(signInDto);
    const { accessToken, refreshToken } = tokens;

    this.cookiesService.setRefreshTokenCookie(res, refreshToken);

    return { accessToken };
  }

  @Get('sign-out')
  @SwaggerUnauthorizedResponse()
  signOut(@Res({ passthrough: true }) res: Response): MessageApiResponseDto {
    this.cookiesService.clearRefreshTokenCookie(res);

    return { message: 'Signed out successfully' };
  }

  @Get('refresh')
  @Public()
  @UseGuards(RefreshTokenGuard)
  refresh(
    @Res({ passthrough: true }) res: Response,
    @RequestUser() user: ActiveUser,
  ): TokenResponseDto {
    const { accessToken, refreshToken } = this.authService.refreshToken(user);

    this.cookiesService.setRefreshTokenCookie(res, refreshToken);

    return {
      accessToken,
    };
  }
}
