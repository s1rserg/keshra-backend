export { ChatModule } from './chat.module';
export { ChatEntity } from './entities/chat.entity';
export { OuterChatService } from './services/outer-chat.service';
export { ChatType } from './enums/chat-type.enum';
export type { Chat, ChatBase, ChatWithParticipants } from './types/contracts';
export { isPublicChat, isPrivateChat } from './types/type-guards';
export { ChatReadSyncService } from './services/chat-read-sync.service';
