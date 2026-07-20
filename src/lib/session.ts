import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.SESSION_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'silap-fallback-secret-do-not-use-in-production';
const COOKIE_NAME = 'silap_session';
const EXPIRY_SECONDS = 30 * 24 * 60 * 60; // 30 days

interface SessionPayload {
  sub: string;
  iat: number;
  exp: number;
}

function base64url(data: Buffer | string): string {
  const buf = typeof data === 'string' ? Buffer.from(data) : data;
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str: string): Buffer {
  let padded = str.replace(/-/g, '+').replace(/_/g, '/');
  while (padded.length % 4) padded += '=';
  return Buffer.from(padded, 'base64');
}

function sign(payload: string): string {
  return base64url(createHmac('sha256', SECRET).update(payload).digest());
}

export function createSessionToken(userId: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify({ sub: userId, iat: now, exp: now + EXPIRY_SECONDS }));
  const signature = sign(`${header}.${body}`);
  return `${header}.${body}.${signature}`;
}

export function verifySessionToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSig = sign(`${header}.${body}`);

    const sigBuf = Buffer.from(signature, 'base64');
    const expectedBuf = Buffer.from(expectedSig, 'base64');
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return null;

    const payload: SessionPayload = JSON.parse(base64urlDecode(body).toString());
    if (!payload.sub || !payload.exp) return null;
    if (Math.floor(Date.now() / 1000) > payload.exp) return null;

    return payload.sub;
  } catch {
    return null;
  }
}

export function sessionCookieName(): string {
  return COOKIE_NAME;
}

export function sessionCookieMaxAge(): number {
  return EXPIRY_SECONDS;
}
