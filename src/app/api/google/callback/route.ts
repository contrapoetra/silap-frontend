import { NextRequest, NextResponse } from 'next/server';
import { pendingSyncs } from '@/lib/sync-store';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

interface GoogleEvent {
  id: string | number;
  pokja: number;
  y: number;
  m: number;
  d: number;
  title: string;
  time: string;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function makeEventBody(ev: GoogleEvent) {
  const hasTime = ev.time && ev.time !== '—';
  if (hasTime) {
    const [hh, mm] = ev.time.split(':').map(Number);
    const start = new Date(ev.y, ev.m - 1, ev.d, hh || 0, mm || 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const fmtLocal = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    return {
      summary: ev.title,
      description: `Pokja ${['', 'I', 'II', 'III', 'IV'][ev.pokja] || ''}`,
      start: { dateTime: fmtLocal(start), timeZone: 'Asia/Jakarta' },
      end: { dateTime: fmtLocal(end), timeZone: 'Asia/Jakarta' },
    };
  }
  const startDate = `${ev.y}-${pad(ev.m)}-${pad(ev.d)}`;
  const endD = new Date(ev.y, ev.m - 1, ev.d + 1);
  const endDate = `${endD.getFullYear()}-${pad(endD.getMonth() + 1)}-${pad(endD.getDate())}`;
  return {
    summary: ev.title,
    description: `Pokja ${['', 'I', 'II', 'III', 'IV'][ev.pokja] || ''}`,
    start: { date: startDate },
    end: { date: endDate },
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/?sync=denied&goto=kalender', req.url));
  }

  if (!state || !pendingSyncs.has(state)) {
    return NextResponse.redirect(new URL('/?sync=expired&goto=kalender', req.url));
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    pendingSyncs.delete(state);
    return NextResponse.redirect(new URL('/?sync=token_error&goto=kalender', req.url));
  }

  const token = await tokenRes.json() as { access_token: string };
  const { events } = pendingSyncs.get(state)!;
  pendingSyncs.delete(state);

  let inserted = 0;
  let failed = 0;
  let debug: string | null = null;

  for (const ev of events) {
    const body = makeEventBody(ev);
    const insertRes = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );
    if (insertRes.ok) {
      if (!debug) {
        const created = await insertRes.json() as { id?: string; htmlLink?: string; status?: string };
        debug = `${created.status || 'ok'}:${created.id || ''}:${created.htmlLink || ''}`;
      }
      inserted++;
    } else {
      const errText = await insertRes.text().catch(() => 'unknown');
      debug = `HTTP ${insertRes.status}: ${errText.slice(0, 200)}`;
      failed++;
    }
  }

  const result = `sync=done&inserted=${inserted}&failed=${failed}&debug=${encodeURIComponent(debug || '')}`;
  return NextResponse.redirect(new URL(`/?${result}&goto=kalender`, req.url));
}
