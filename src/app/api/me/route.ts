import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySessionToken, sessionCookieName } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`${sessionCookieName()}=([^;]+)`));
    const token = match?.[1];
    if (!token) return NextResponse.json({ user: null });

    const userId = await verifySessionToken(token);
    if (!userId) return NextResponse.json({ user: null });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
    if (!supabaseUrl || !supabaseKey) return NextResponse.json({ user: null });

    const sb = createClient(supabaseUrl, supabaseKey);
    const { data } = await sb.from('users').select('id, nik, role, name, pokja, avatar').eq('id', userId);
    if (data && data.length > 0) {
      return NextResponse.json({ user: data[0] });
    }

    return NextResponse.json({ user: null });
  } catch (err) {
    console.error('Failed to restore session:', err);
    return NextResponse.json({ user: null });
  }
}
