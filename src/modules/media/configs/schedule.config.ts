import { registerAs } from '@nestjs/config';

export const scheduleConfiguration = registerAs('schedule-config', () => ({
  mediaGcSchedule: process.env.MEDIA_GC_SCHEDULE!,
  mediaGcRetrySchedule: process.env.MEDIA_GC_RETRY_SCHEDULE!,
}));
