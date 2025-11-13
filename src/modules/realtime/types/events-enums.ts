export enum ClientToServerEvent {
  CHAT_JOIN = 'chat:join',
  CHAT_LEAVE = 'chat:leave',
  CHAT_DELTA_JOIN = 'chat:delta:join',
  CHAT_DELTA_LEAVE = 'chat:delta:leave',
}

export enum ServerToClientEvent {
  APP_ERROR = 'app:error',
  CHAT_ERROR = 'chat:error',
  ME_JOINED_CHAT = 'me:joined:chat',
  ME_LEFT_CHAT = 'me:left:chat',
  CHAT_MESSAGE_NEW = 'chat:message:new',
  CHAT_DELTA_NEW = 'chat:delta:new',
  CHAT_PRESENCE_USER_ONLINE = 'chat:presence:user:online',
  CHAT_PRESENCE_USER_OFFLINE = 'chat:presence:user:offline',
}
