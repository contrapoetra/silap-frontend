import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSessionToken, sessionCookieName, sessionCookieMaxAge } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { nik, password } = await req.json();

    if (!nik || !password) {
      return NextResponse.json({ error: 'NIK dan password harus diisi.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Konfigurasi server tidak lengkap.' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: users, error } = await supabase
      .from('users')
      .select('id, nik, password, role, name, pokja, avatar')
      .eq('nik', nik.trim());

    if (error) {
      console.error('Login query error:', error);
      return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'NIK atau password salah. Coba lagi.' }, { status: 401 });
    }

    const user = users[0];

    if (user.password !== password.trim()) {
      return NextResponse.json({ error: 'NIK atau password salah. Coba lagi.' }, { status: 401 });
    }

    const token = createSessionToken(user.id);

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        pokja: user.pokja,
        nik: user.nik,
        avatar: user.avatar,
      },
    });

    response.cookies.set(sessionCookieName(), token, {
      path: '/',
      maxAge: sessionCookieMaxAge(),
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
