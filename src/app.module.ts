import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { ExceptionFilterModule } from '@app/exception-filter';
import { AppConfigModule } from '@infrastructure/app-config';
import { AppJwtModule } from '@infrastructure/app-jwt-module';
import { DatabaseModule } from '@infrastructure/database';
import { RedisModule } from '@infrastructure/redis';
import { AuthModule } from '@modules/auth';
import { ChatModule } from '@modules/chat';
import { MessageModule } from '@modules/message';
import { RealtimeModule } from '@modules/realtime';
import { UserModule } from '@modules/user';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [
    AppConfigModule,
    ExceptionFilterModule,
    DatabaseModule,
    AppJwtModule,
    RedisModule,
    UserModule,
    AuthModule,
    ChatModule,
    MessageModule,
    RealtimeModule,
    MediaModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
