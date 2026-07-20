import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySessionToken, sessionCookieName, createSessionToken, sessionCookieMaxAge } from '@/lib/session';
import { hashPassword, verifyPassword } from '@/lib/password';

export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`${sessionCookieName()}=([^;]+)`));
    const token = match?.[1];

    if (!token) {
      return NextResponse.json({ error: 'Sesi tidak valid.' }, { status: 401 });
    }

    const userId = verifySessionToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Sesi tidak valid.' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Password saat ini dan password baru harus diisi.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password baru minimal 6 karakter.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Konfigurasi server tidak lengkap.' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: users, error: fetchErr } = await supabase
      .from('users')
      .select('id, password')
      .eq('id', userId);

    if (fetchErr || !users || users.length === 0) {
      return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 });
    }

    const user = users[0];

    if (!verifyPassword(currentPassword.trim(), user.password)) {
      return NextResponse.json({ error: 'Password saat ini salah.' }, { status: 401 });
    }

    const { error: updateErr } = await supabase
      .from('users')
      .update({ password: hashPassword(newPassword.trim()) })
      .eq('id', userId);

    if (updateErr) {
      console.error('Password update error:', updateErr);
      return NextResponse.json({ error: 'Gagal mengubah password.' }, { status: 500 });
    }

    const newToken = createSessionToken(userId);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookieName(), newToken, {
      path: '/',
      maxAge: sessionCookieMaxAge(),
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (err) {
    console.error('Change password error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
