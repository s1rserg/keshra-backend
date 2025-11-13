import { Module } from '@nestjs/common';

import { ExceptionFilterModule } from '@app/exception-filter';
import { AppConfigModule } from '@infrastructure/app-config';
import { AppJwtModule } from '@infrastructure/app-jwt-module';
import { DatabaseModule } from '@infrastructure/database';
import { AuthModule } from '@modules/auth';
import { ChatModule } from '@modules/chat';
import { MessageModule } from '@modules/message';
import { RealtimeModule } from '@modules/realtime';
import { UserModule } from '@modules/user';

import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    AppConfigModule,
    ExceptionFilterModule,
    DatabaseModule,
    AppJwtModule,
    UserModule,
    AuthModule,
    ChatModule,
    MessageModule,
    RealtimeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
