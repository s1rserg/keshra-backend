import { registerAs } from '@nestjs/config';

export const readSyncScheduleConfiguration = registerAs('read-sync-schedule-config', () => ({
  syncSchedule: process.env.CHAT_READ_SYNC_SCHEDULE!,
}));
