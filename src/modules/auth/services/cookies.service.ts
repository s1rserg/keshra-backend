import type { Response } from 'express';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CookiesService {
  setRefreshTokenCookie(res: Response, refresh_token: string) {
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      sameSite: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: parseInt(process.env.REFRESH_TOKEN_TTL!) * 1000,
    });
  }

  clearRefreshTokenCookie(res: Response) {
    res.clearCookie('refresh_token');
  }
}
