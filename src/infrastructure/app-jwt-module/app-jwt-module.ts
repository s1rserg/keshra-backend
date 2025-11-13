import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { jwtConfiguration } from './configs/jwt.config';
import { AppJwtService } from './app-jwt.service';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfiguration),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfiguration)],
      inject: [jwtConfiguration.KEY],
      useFactory: (jwtConfig: ConfigType<typeof jwtConfiguration>) => ({
        secret: jwtConfig.jwtSecret,
      }),
    }),
  ],
  providers: [AppJwtService],
  exports: [AppJwtService],
})
export class AppJwtModule {}
