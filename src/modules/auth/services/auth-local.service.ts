import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { TokensPair } from '@infrastructure/app-jwt-module';
import { AppJwtService } from '@infrastructure/app-jwt-module';
import { UserService } from '@modules/user';

import { AuthProvider } from '@common/types';

import type { SignInLocalDto } from '../dto/sign-in-local.dto';
import type { SignUpLocalDto } from '../dto/sign-up-local.dto';
import { AuthRegistrationService } from './auth-registration.service';
import { CryptoService } from './crypto.service';
import { AuthRepository } from '../repositories/auth.repository';

@Injectable()
export class AuthLocalService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: AppJwtService,
    private readonly cryptoService: CryptoService,
    private readonly authRepository: AuthRepository,
    private readonly authRegistrationService: AuthRegistrationService,
  ) {}

  async signUp(signUpDto: SignUpLocalDto): Promise<TokensPair> {
    // Check if the auth record already exists
    const existingAuth = await this.authRepository.findByEmailAndProvider(
      signUpDto.email,
      AuthProvider.LOCAL,
    );

    if (existingAuth) {
      throw new ConflictException('User with this email already exists');
    }

    const existingUser = await this.userService.findByUsernameOrNull(signUpDto.username);
    if (existingUser) {
      throw new ConflictException('User with this username already exists');
    }

    const auth = await this.authRegistrationService.registerUser({
      provider: AuthProvider.LOCAL,
      email: signUpDto.email,
      password: signUpDto.password,
      username: signUpDto.username,
    });

    return this.jwtService.signTokensPair({
      id: auth.userId,
      email: auth.email,
      provider: auth.provider,
    });
  }

  async signIn(signUpDto: SignInLocalDto): Promise<TokensPair> {
    const existingAuth = await this.authRepository.findByEmailAndProvider(
      signUpDto.email,
      AuthProvider.LOCAL,
    );

    if (!existingAuth) {
      throw new NotFoundException('User not found');
    }

    const passwordVerified = await this.cryptoService.compare(
      signUpDto.password,
      existingAuth.password!,
    );

    if (!passwordVerified) {
      throw new BadRequestException('Password is incorrect');
    }

    return this.jwtService.signTokensPair({
      id: existingAuth.userId,
      email: existingAuth.email,
      provider: existingAuth.provider,
    });
  }
}
