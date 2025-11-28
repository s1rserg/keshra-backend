export enum ClientToServerEvent {
  CHAT_JOIN = 'chat:join',
  CHAT_LEAVE = 'chat:leave',
  CHAT_DELTA_JOIN = 'chat:delta:join',
  CHAT_DELTA_LEAVE = 'chat:delta:leave',
  CHAT_MARK_READ = 'chat:mark:read',
}

export enum ServerToClientEvent {
  APP_ERROR = 'app:error',
  CHAT_ERROR = 'chat:error',
  CHAT_NEW = 'chat:new',
  ME_JOINED_CHAT = 'me:joined:chat',
  ME_LEFT_CHAT = 'me:left:chat',
  CHAT_MESSAGE_NEW = 'chat:message:new',
  CHAT_MESSAGE_UPDATE = 'chat:message:update',
  CHAT_MESSAGE_DELETE = 'chat:message:delete',
  CHAT_REACTION_NEW = 'chat:reaction:new',
  CHAT_REACTION_DELETE = 'chat:reaction:delete',
  CHAT_DELTA_NEW = 'chat:delta:new',
  CHAT_DELTA_UPDATE = 'chat:delta:update',
  CHAT_PRESENCE_USER_ONLINE = 'chat:presence:user:online',
  CHAT_PRESENCE_USER_OFFLINE = 'chat:presence:user:offline',
}
