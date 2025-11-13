import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';

import { ServerToClientEvent } from '../types';

@Catch(WsException)
export class WsExceptionFilter implements ExceptionFilter<WsException> {
  catch(exception: WsException, host: ArgumentsHost): void {
    const socket = host.switchToWs().getClient<Socket>();
    socket.emit(ServerToClientEvent.APP_ERROR, exception.getError());
  }
}
