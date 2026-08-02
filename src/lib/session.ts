const SECRET = process.env.SESSION_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'silap-fallback-secret-do-not-use-in-production';
const COOKIE_NAME = 'silap_session';
const EXPIRY_SECONDS = 30 * 24 * 60 * 60; // 30 days

const encoder = new TextEncoder();

interface SessionPayload {
  sub: string;
  iat: number;
  exp: number;
}

function bytesToBase64url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlToBytes(str: string): Uint8Array {
  let padded = str.replace(/-/g, '+').replace(/_/g, '/');
  while (padded.length % 4) padded += '=';
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacSign(input: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(input));
  return bytesToBase64url(new Uint8Array(signature));
}

export async function createSessionToken(userId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = bytesToBase64url(encoder.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = bytesToBase64url(encoder.encode(JSON.stringify({ sub: userId, iat: now, exp: now + EXPIRY_SECONDS })));
  const signature = await hmacSign(`${header}.${body}`);
  return `${header}.${body}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSig = await hmacSign(`${header}.${body}`);
    if (!constantTimeEqual(signature, expectedSig)) return null;

    const payload: SessionPayload = JSON.parse(new TextDecoder().decode(base64urlToBytes(body)));
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
