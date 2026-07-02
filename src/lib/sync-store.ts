import type { CalendarEvent } from './types';

export const pendingSyncs = new Map<string, { events: CalendarEvent[] }>();
