import { NextRequest, NextResponse } from 'next/server';
import { pendingSyncs } from '@/lib/sync-store';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const events = body.events as { id: string | number; pokja: number; y: number; m: number; d: number; title: string; time: string }[] | undefined;
  if (!events || !Array.isArray(events) || events.length === 0) {
    return NextResponse.json({ error: 'No events provided' }, { status: 400 });
  }

  const sessionId = crypto.randomUUID();
  pendingSyncs.set(sessionId, { events });

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: sessionId,
  });

  return NextResponse.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
}
