import App from "@/components/App";
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { verifySessionToken } from '@/lib/session';

export default async function Home() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('silap_session');

  let initialUserId: string | null = null;
  let initialUsers: any[] = [];

  if (sessionCookie?.value) {
    const userId = verifySessionToken(sessionCookie.value);
    if (userId) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
      if (supabaseUrl && supabaseKey) {
        try {
          const sb = createClient(supabaseUrl, supabaseKey);
          const { data } = await sb.from('users').select('id, nik, role, name, pokja, avatar').eq('id', userId);
          if (data && data.length > 0) {
            initialUserId = userId;
            initialUsers = data;
          }
        } catch (e) {
          console.error('Failed to restore session server-side:', e);
        }
      }
    }
  }

  return <App initialUserId={initialUserId} initialUsers={initialUsers} initialPath="/" />;
}
