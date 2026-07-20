import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySessionToken, sessionCookieName } from '@/lib/session';
import { hashPassword } from '@/lib/password';

async function getAuthUserId(req: NextRequest): Promise<string | null> {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`${sessionCookieName()}=([^;]+)`));
  const token = match?.[1];
  if (!token) return null;
  return verifySessionToken(token);
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const authUserId = await getAuthUserId(req);
    if (!authUserId) {
      return NextResponse.json({ error: 'Sesi tidak valid.' }, { status: 401 });
    }

    const supabase = getSupabase();
    const { data: authUser } = await supabase.from('users').select('role').eq('id', authUserId).single();
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Tidak memiliki akses.' }, { status: 403 });
    }

    const { nik, name, password, role, pokja, avatar } = await req.json();

    if (!nik?.trim() || !name?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'NIK, nama, dan password harus diisi.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        nik: nik.trim(),
        name: name.trim(),
        password: hashPassword(password.trim()),
        role: role || 'anggota',
        pokja: pokja ?? null,
        avatar: avatar || null,
      })
      .select('id, nik, role, name, pokja, avatar')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (err) {
    console.error('Create user error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUserId = await getAuthUserId(req);
    if (!authUserId) {
      return NextResponse.json({ error: 'Sesi tidak valid.' }, { status: 401 });
    }

    const supabase = getSupabase();
    const { data: authUser } = await supabase.from('users').select('role').eq('id', authUserId).single();
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Tidak memiliki akses.' }, { status: 403 });
    }

    const { id, nik, name, password, role, pokja, avatar } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'User ID diperlukan.' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      nik: nik?.trim(),
      name: name?.trim(),
      role,
      pokja: pokja ?? null,
      avatar: avatar || null,
    };

    if (password?.trim()) {
      updatePayload.password = hashPassword(password.trim());
    }

    const { error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Update user error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
