import type { DefaultEventsMap, Server, Socket } from 'socket.io';

import type { ActiveUser } from '@common/types';

import type { ClientToServerEvents } from './client-to-server-events';
import type { ServerToClientEvents } from './server-to-client-events';

interface SocketData {
  user?: ActiveUser;
}

export type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  DefaultEventsMap,
  SocketData
>;

export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  DefaultEventsMap,
  SocketData
>;
