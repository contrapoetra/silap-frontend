'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { reducer, initialState, AppState, AppAction } from '@/lib/state';
import { computeDerived } from '@/lib/derived';
import { MilkdownProvider } from '@milkdown/react';
import { BerandaSection, PokjaOverviewSection, PokjaDetailSection, GaleriSection, KalenderSection, BerkasSection, PengumumanSection, LaporanSection, DashboardSection, PKKMembersSection, InovasiSection, EditorSection, BlogPostSection, InventarisSection, SuratSection } from './Sections';
import { LoginModal, EventModal, GalModal, FileUploadModal, AvatarModal, UserModal, ConfirmDeleteModal } from './Modals';
import { supabase } from '@/lib/supabase';

export default function App({ initialUserId, initialUsers }: { initialUserId?: string | null; initialUsers?: any[] }) {
  const [st, dispatch] = useReducer<AppState, [AppAction]>(reducer, {
    ...initialState,
    currentUserId: initialUserId ?? null,
    users: initialUsers ?? [],
  });
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    isDanger?: boolean;
    onConfirm: () => void;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((msg: string) => {
    dispatch({ type: 'SET_TOAST', payload: msg });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => dispatch({ type: 'SET_TOAST', payload: null }), 2800);
  }, []);

  const go = useCallback((route: string) => {
    dispatch({ type: 'SET_ROUTE', payload: route });
    window.scrollTo(0, 0);
  }, []);

  const openPokja = useCallback((p: { pokja: number; tab?: string }) => {
    dispatch({ type: 'OPEN_POKJA', payload: p });
    window.scrollTo(0, 0);
  }, []);

  // Load initial data and restore session on mount (once)
  useEffect(() => {
    let cancelled = false;

    async function initApp() {
      try {
        const [
          { data: users, error: errUsers },
          { data: events, error: errEvents },
          { data: gallery, error: errGallery },
          { data: files, error: errFiles },
          { data: reports, error: errReports },
        ] = await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('events').select('*'),
          supabase.from('gallery').select('*').order('id', { ascending: false }),
          supabase.from('files').select('*'),
          supabase.from('reports').select('*'),
        ]);

        if (cancelled) return;

        let orgPositionsData: any[] = [];
        try { const { data } = await supabase.from('org_positions').select('*').order('sort_order'); orgPositionsData = data || []; } catch (_) {}

        let blogPostsData: any[] = [];
        try { const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false }); blogPostsData = (data || []).map((p: any) => ({ ...p, date: p.created_at })); } catch (_) {}

        if (errUsers || errEvents || errGallery || errFiles || errReports) {
          console.error({ errUsers, errEvents, errGallery, errFiles, errReports });
          showToast('Koneksi ke Supabase gagal atau tabel tidak ditemukan');
        }

        // Map events from DB format (year, month, day) to frontend format (y, m, d)
        const mappedEvents = (events || []).map((e: any) => ({
          id: e.id,
          pokja: e.pokja,
          y: e.year,
          m: e.month,
          d: e.day,
          title: e.title,
          time: e.time,
        }));

        let pkkMembersData: any[] = [];
        try { const { data } = await supabase.from('pkk_members').select('*'); pkkMembersData = data || []; } catch (_) {}

        let suratData: any[] = [];
        try { const { data } = await supabase.from('surat').select('*'); suratData = data || []; } catch (_) {}

        let pengumumanData: any[] = [];
        try { const { data } = await supabase.from('pengumuman').select('*').order('created_at', { ascending: false }); pengumumanData = data || []; } catch (_) {}

        if (!cancelled) {
          dispatch({
            type: 'SET_INITIAL_DATA',
            payload: {
              users: users || [],
              events: mappedEvents,
              gallery: gallery || [],
              files: files || [],
              reports: reports || [],
              pkkMembers: pkkMembersData,
              inventory: [],
              surat: suratData,
              blogPosts: blogPostsData,
              orgPositions: orgPositionsData,
              pengumuman: pengumumanData,
            },
          });

          // Navigate to dashboard if session was restored via cookie
          if (initialUserId && users?.some((u: any) => u.id === initialUserId)) {
            dispatch({ type: 'DO_LOGIN', payload: initialUserId });
          } else if (st.currentUserId && !users?.some((u: any) => u.id === st.currentUserId)) {
            dispatch({ type: 'LOGOUT' });
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        showToast('Terjadi kesalahan saat menghubungkan ke database');
        setLoading(false);
      }
    }
    
    initApp();
    return () => { cancelled = true; };
  }, [dispatch, showToast]);

  // Keep data in sync when returning to the tab
  useEffect(() => {
    async function refreshData() {
      try {
        const [
          { data: users },
          { data: events },
          { data: gallery },
          { data: files },
          { data: reports },
        ] = await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('events').select('*'),
          supabase.from('gallery').select('*').order('id', { ascending: false }),
          supabase.from('files').select('*'),
          supabase.from('reports').select('*'),
        ]);

        let orgPositionsData: any[] = [];
        try { const { data } = await supabase.from('org_positions').select('*').order('sort_order'); orgPositionsData = data || []; } catch (_) {}

        let blogPostsData: any[] = [];
        try { const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false }); blogPostsData = (data || []).map((p: any) => ({ ...p, date: p.created_at })); } catch (_) {}

        let pkkMembersData: any[] = [];
        try { const { data } = await supabase.from('pkk_members').select('*'); pkkMembersData = data || []; } catch (_) {}

        const mappedEvents = (events || []).map((e: any) => ({
          id: e.id,
          pokja: e.pokja,
          y: e.year,
          m: e.month,
          d: e.day,
          title: e.title,
          time: e.time,
        }));

        let suratData: any[] = [];
        try { const { data } = await supabase.from('surat').select('*'); suratData = data || []; } catch (_) {}

        let pengumumanData: any[] = [];
        try { const { data } = await supabase.from('pengumuman').select('*').order('created_at', { ascending: false }); pengumumanData = data || []; } catch (_) {}

        dispatch({
          type: 'SET_INITIAL_DATA',
          payload: {
            users: users || [],
            events: mappedEvents,
            gallery: gallery || [],
            files: files || [],
            reports: reports || [],
            pkkMembers: pkkMembersData,
            inventory: [],
            surat: suratData,
            blogPosts: blogPostsData,
            orgPositions: orgPositionsData,
            pengumuman: pengumumanData,
          },
        });
      } catch (err) {
        console.warn('Failed to refresh data on window focus:', err);
      }
    }

    window.addEventListener('focus', refreshData);
    return () => {
      window.removeEventListener('focus', refreshData);
    };
  }, [dispatch]);

  // Read sync result from Google Calendar OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sync = params.get('sync');
    if (sync) {
      const goto = params.get('goto') || 'kalender';
      go(goto);
      if (sync === 'done') {
        const ins = params.get('inserted');
        const fail = params.get('failed');
        showToast(`Sync selesai! ${ins} event ditambahkan${Number(fail) > 0 ? `, ${fail} gagal` : ''}`);
      } else if (sync === 'denied') {
        showToast('Sync dibatalkan');
      } else if (sync === 'expired' || sync === 'token_error') {
        showToast('Sync gagal. Coba lagi.');
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Synchronize currentUserId with cookie
  useEffect(() => {
    if (st.currentUserId) {
      document.cookie = `silap_session=${st.currentUserId}; path=/; max-age=2592000; SameSite=Lax`;
    }
  }, [st.currentUserId]);

  const asyncDispatch = useCallback((action: AppAction) => {
    (async () => {
      switch (action.type) {
        case 'ADD_EVENT': {
          const { error, data } = await supabase
            .from('events')
            .insert({
              pokja: action.payload.pokja,
              year: action.payload.y,
              month: action.payload.m,
              day: action.payload.d,
              title: action.payload.title,
              time: action.payload.time,
            })
            .select()
            .single();

          if (error) {
            showToast('Gagal menambahkan kegiatan: ' + error.message);
            return;
          }
          dispatch({ type: 'ADD_EVENT', payload: { ...action.payload, id: data.id } });
          break;
        }
        case 'DELETE_EVENT': {
          setConfirmModal({
            title: 'Hapus Kegiatan?',
            description: 'Apakah Anda yakin ingin menghapus kegiatan ini? Tindakan ini tidak dapat dibatalkan.',
            confirmLabel: 'Hapus',
            isDanger: true,
            onConfirm: async () => {
              const { error } = await supabase.from('events').delete().eq('id', action.payload);
              if (error) {
                showToast('Gagal menghapus kegiatan: ' + error.message);
                return;
              }
              dispatch({ type: 'DELETE_EVENT', payload: action.payload });
              setConfirmModal(null);
            }
          });
          break;
        }
        case 'UPDATE_EVENT': {
          const { error } = await supabase
            .from('events')
            .update({
              pokja: action.payload.pokja,
              year: action.payload.y,
              month: action.payload.m,
              day: action.payload.d,
              title: action.payload.title,
              time: action.payload.time,
            })
            .eq('id', action.payload.id);

          if (error) {
            showToast('Gagal memperbarui kegiatan: ' + error.message);
            return;
          }
          dispatch({ type: 'UPDATE_EVENT', payload: action.payload });
          break;
        }
        case 'ADD_GALLERY': {
          const tempId = action.payload.id;
          dispatch({ type: 'ADD_GALLERY', payload: action.payload });

          const { error, data } = await supabase
            .from('gallery')
            .insert({
              pokja: action.payload.pokja,
              caption: action.payload.caption,
              date: action.payload.date,
              tag: action.payload.tag,
              image: action.payload.image || null,
            })
            .select()
            .single();

          if (error) {
            dispatch({ type: 'DELETE_GALLERY', payload: tempId });
            showToast('Gagal mengunggah foto: ' + error.message);
            return;
          }
          dispatch({ type: 'UPDATE_GALLERY_ID', payload: { oldId: tempId, newId: data.id } });
          break;
        }
        case 'DELETE_GALLERY': {
          setConfirmModal({
            title: 'Hapus Foto?',
            description: 'Apakah Anda yakin ingin menghapus foto dari galeri ini? Tindakan ini tidak dapat dibatalkan.',
            confirmLabel: 'Hapus',
            isDanger: true,
            onConfirm: async () => {
              const { data } = await supabase.from('gallery').select('image').eq('id', action.payload).single();
              if (data?.image && data.image.startsWith('https://')) {
                fetch('/api/delete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url: data.image }),
                }).catch(() => {});
              }
              const { error } = await supabase.from('gallery').delete().eq('id', action.payload);
              if (error) {
                showToast('Gagal menghapus foto: ' + error.message);
                return;
              }
              dispatch({ type: 'DELETE_GALLERY', payload: action.payload });
              setConfirmModal(null);
            }
          });
          break;
        }
        case 'ADD_FILE': {
          const { error, data } = await supabase
            .from('files')
            .insert({
              pokja: action.payload.pokja,
              name: action.payload.name,
              ext: action.payload.ext,
              size: action.payload.size,
              by: action.payload.by,
              date: action.payload.date,
              url: action.payload.url,
            })
            .select()
            .single();

          if (error) {
            showToast('Gagal mengunggah berkas: ' + error.message);
            return;
          }
          dispatch({ type: 'ADD_FILE', payload: { ...action.payload, id: data.id } });
          break;
        }
        case 'DELETE_FILE': {
          setConfirmModal({
            title: 'Hapus Berkas?',
            description: 'Apakah Anda yakin ingin menghapus berkas ini? Tindakan ini tidak dapat dibatalkan.',
            confirmLabel: 'Hapus',
            isDanger: true,
            onConfirm: async () => {
              const { data } = await supabase.from('files').select('url').eq('id', action.payload).single();
              if (data?.url && data.url.startsWith('https://')) {
                fetch('/api/delete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url: data.url }),
                }).catch(() => {});
              }
              const { error } = await supabase.from('files').delete().eq('id', action.payload);
              if (error) {
                showToast('Gagal menghapus berkas: ' + error.message);
                return;
              }
              dispatch({ type: 'DELETE_FILE', payload: action.payload });
              setConfirmModal(null);
            }
          });
          break;
        }
        case 'ADD_REPORT': {
          const { error, data } = await supabase
            .from('reports')
            .insert({
              date: action.payload.date,
              name: action.payload.name,
              contact: action.payload.contact,
              pokja: action.payload.pokja,
              desc: action.payload.desc,
              status: action.payload.status,
            })
            .select()
            .single();

          if (error) {
            showToast('Gagal mengirim laporan: ' + error.message);
            return;
          }
          dispatch({ type: 'ADD_REPORT', payload: { ...action.payload, id: data.id } });
          break;
        }
        case 'UPDATE_REPORT_STATUS': {
          const report = st.reports.find(r => r.id === action.payload);
          if (!report) return;
          const STATUS_NEXT: Record<string, string> = {
            'Baru': 'Diproses',
            'Diproses': 'Selesai',
            'Selesai': 'Baru'
          };
          const nextStatus = STATUS_NEXT[report.status] || 'Baru';
          const { error } = await supabase
            .from('reports')
            .update({ status: nextStatus })
            .eq('id', action.payload);

          if (error) {
            showToast('Gagal mengubah status laporan: ' + error.message);
            return;
          }
          dispatch({ type: 'UPDATE_REPORT_STATUS', payload: action.payload });
          break;
        }
        case 'ADD_USER': {
          const { error, data } = await supabase
            .from('users')
            .insert({
              nik: action.payload.nik,
              password: action.payload.password,
              role: action.payload.role,
              name: action.payload.name,
              pokja: action.payload.pokja,
              avatar: action.payload.avatar,
            })
            .select()
            .single();

          if (error) {
            showToast('Gagal membuat akun: ' + error.message);
            return;
          }
          dispatch({ type: 'ADD_USER', payload: { ...action.payload, id: data.id } });
          break;
        }
        case 'UPDATE_USER': {
          const { error } = await supabase
            .from('users')
            .update({
              nik: action.payload.nik,
              password: action.payload.password,
              role: action.payload.role,
              name: action.payload.name,
              pokja: action.payload.pokja,
              avatar: action.payload.avatar,
            })
            .eq('id', action.payload.id);

          if (error) {
            showToast('Gagal memperbarui akun: ' + error.message);
            return;
          }
          dispatch({ type: 'UPDATE_USER', payload: action.payload });
          break;
        }
        case 'DELETE_USER': {
          const { error } = await supabase.from('users').delete().eq('id', action.payload);
          if (error) {
            showToast('Gagal menghapus akun: ' + error.message);
            return;
          }
          dispatch({ type: 'DELETE_USER', payload: action.payload });
          break;
        }
        case 'SAVE_AVATAR': {
          const { error } = await supabase
            .from('users')
            .update({ avatar: action.payload })
            .eq('id', st.currentUserId!);

          if (error) {
            showToast('Gagal menyimpan foto profil: ' + error.message);
            return;
          }
          dispatch({ type: 'SAVE_AVATAR', payload: action.payload });
          break;
        }
        case 'ADD_BLOG_POST': {
          const { error, data } = await supabase
            .from('blog_posts')
            .insert({
              title: action.payload.title,
              excerpt: action.payload.excerpt,
              category: action.payload.category,
              content: action.payload.content,
              author: action.payload.author || 'Sekretaris',
            })
            .select()
            .single();

          if (error) {
            showToast('Gagal menambahkan artikel: ' + error.message);
            return;
          }
          dispatch({ type: 'ADD_BLOG_POST', payload: { ...action.payload, id: data.id, created_at: data.created_at } });
          break;
        }
        case 'UPDATE_BLOG_POST': {
          const { error, data } = await supabase
            .from('blog_posts')
            .update({
              title: action.payload.title,
              excerpt: action.payload.excerpt,
              category: action.payload.category,
              content: action.payload.content,
              author: action.payload.author,
            })
            .eq('id', action.payload.id)
            .select()
            .single();

          if (error) {
            showToast('Gagal mengupdate artikel: ' + error.message);
            return;
          }
          dispatch({ type: 'UPDATE_BLOG_POST', payload: { ...action.payload, id: data.id, created_at: data.created_at } });
          showToast('Artikel "' + action.payload.title + '" diperbarui');
          break;
        }
        case 'DELETE_BLOG_POST': {
          const { error } = await supabase.from('blog_posts').delete().eq('id', action.payload);
          if (error) {
            showToast('Gagal menghapus artikel: ' + error.message);
            return;
          }
          dispatch({ type: 'DELETE_BLOG_POST', payload: action.payload });
          break;
        }
        case 'ADD_PKK_MEMBER': {
          const { error, data } = await supabase
            .from('pkk_members')
            .insert({
              name: action.payload.name,
              position: action.payload.position,
              gender: action.payload.gender,
              birth_place: action.payload.birth_place,
              birth_date: action.payload.birth_date,
              marital_status: action.payload.marital_status,
              address: action.payload.address,
              education: action.payload.education,
              occupation: action.payload.occupation,
              membership_status: action.payload.membership_status,
            })
            .select()
            .single();

          if (error) {
            showToast('Gagal menambahkan anggota: ' + error.message);
            return;
          }
          dispatch({ type: 'ADD_PKK_MEMBER', payload: { ...action.payload, id: data.id } });
          showToast('Anggota ditambahkan');
          break;
        }
        case 'UPDATE_PKK_MEMBER': {
          const { error } = await supabase
            .from('pkk_members')
            .update({
              name: action.payload.name,
              position: action.payload.position,
              gender: action.payload.gender,
              birth_place: action.payload.birth_place,
              birth_date: action.payload.birth_date,
              marital_status: action.payload.marital_status,
              address: action.payload.address,
              education: action.payload.education,
              occupation: action.payload.occupation,
              membership_status: action.payload.membership_status,
            })
            .eq('id', action.payload.id);

          if (error) {
            showToast('Gagal memperbarui anggota: ' + error.message);
            return;
          }
          dispatch({ type: 'UPDATE_PKK_MEMBER', payload: action.payload });
          showToast('Anggota diperbarui');
          break;
        }
        case 'DELETE_PKK_MEMBER': {
          const { error } = await supabase.from('pkk_members').delete().eq('id', action.payload);
          if (error) {
            showToast('Gagal menghapus anggota: ' + error.message);
            return;
          }
          dispatch({ type: 'DELETE_PKK_MEMBER', payload: action.payload });
          showToast('Anggota dihapus');
          break;
        }
        case 'ADD_INVENTORY': {
          dispatch({ type: 'ADD_INVENTORY', payload: action.payload });
          showToast('Barang ditambahkan');
          break;
        }
        case 'UPDATE_INVENTORY': {
          dispatch({ type: 'UPDATE_INVENTORY', payload: action.payload });
          showToast('Barang diperbarui');
          break;
        }
        case 'DELETE_INVENTORY': {
          dispatch({ type: 'DELETE_INVENTORY', payload: action.payload });
          showToast('Barang dihapus');
          break;
        }
        case 'ADD_SURAT': {
          const { error, data } = await supabase
            .from('surat')
            .insert({
              type: action.payload.type,
              tanggal_terima: action.payload.tanggal_terima,
              tanggal_surat: action.payload.tanggal_surat,
              nomor_surat: action.payload.nomor_surat,
              asal_surat_dari: action.payload.asal_surat_dari,
              perihal: action.payload.perihal,
              lampiran: action.payload.lampiran,
              diteruskan_kepada: action.payload.diteruskan_kepada,
            })
            .select()
            .single();

          if (error) {
            showToast('Gagal menambahkan surat: ' + error.message);
            return;
          }
          dispatch({ type: 'ADD_SURAT', payload: { ...action.payload, id: data.id } });
          break;
        }
        case 'UPDATE_SURAT': {
          const { error } = await supabase
            .from('surat')
            .update({
              type: action.payload.type,
              tanggal_terima: action.payload.tanggal_terima,
              tanggal_surat: action.payload.tanggal_surat,
              nomor_surat: action.payload.nomor_surat,
              asal_surat_dari: action.payload.asal_surat_dari,
              perihal: action.payload.perihal,
              lampiran: action.payload.lampiran,
              diteruskan_kepada: action.payload.diteruskan_kepada,
            })
            .eq('id', action.payload.id);

          if (error) {
            showToast('Gagal memperbarui surat: ' + error.message);
            return;
          }
          dispatch({ type: 'UPDATE_SURAT', payload: action.payload });
          showToast('Surat diperbarui');
          break;
        }
        case 'DELETE_SURAT': {
          const { error } = await supabase.from('surat').delete().eq('id', action.payload);
          if (error) {
            showToast('Gagal menghapus surat: ' + error.message);
            return;
          }
          dispatch({ type: 'DELETE_SURAT', payload: action.payload });
          break;
        }
        case 'ADD_PENGUMUMAN': {
          const { error: addPengErr, data: addPengData } = await supabase
            .from('pengumuman')
            .insert({
              image: action.payload.image,
              caption: action.payload.caption,
              expires_at: action.payload.expires_at,
              created_at: action.payload.created_at,
              created_by: action.payload.created_by,
            })
            .select()
            .single();

          if (addPengErr) {
            showToast('Gagal menambahkan pengumuman: ' + addPengErr.message);
            return;
          }
          dispatch({ type: 'ADD_PENGUMUMAN', payload: { ...action.payload, id: addPengData.id } });
          showToast('Pengumuman ditambahkan');
          break;
        }
        case 'UPDATE_PENGUMUMAN': {
          const { error: updPengErr } = await supabase
            .from('pengumuman')
            .update({
              image: action.payload.image,
              caption: action.payload.caption,
              expires_at: action.payload.expires_at,
            })
            .eq('id', action.payload.id);

          if (updPengErr) {
            showToast('Gagal memperbarui pengumuman: ' + updPengErr.message);
            return;
          }
          dispatch({ type: 'UPDATE_PENGUMUMAN', payload: action.payload });
          showToast('Pengumuman diperbarui');
          break;
        }
        case 'DELETE_PENGUMUMAN': {
          setConfirmModal({
            title: 'Hapus Pengumuman?',
            description: 'Apakah Anda yakin ingin menghapus pengumuman ini? Tindakan ini tidak dapat dibatalkan.',
            confirmLabel: 'Hapus',
            isDanger: true,
            onConfirm: async () => {
              const { data: pengDel } = await supabase.from('pengumuman').select('image').eq('id', action.payload).single();
              if (pengDel?.image && pengDel.image.startsWith('https://')) {
                fetch('/api/delete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url: pengDel.image }),
                }).catch(() => {});
              }
              const { error: delPengErr } = await supabase.from('pengumuman').delete().eq('id', action.payload);
              if (delPengErr) {
                showToast('Gagal menghapus pengumuman: ' + delPengErr.message);
                return;
              }
              dispatch({ type: 'DELETE_PENGUMUMAN', payload: action.payload });
              setConfirmModal(null);
              showToast('Pengumuman dihapus');
            }
          });
          break;
        }
        default:
          dispatch(action);
      }
    })();
  }, [st.reports, st.currentUserId, showToast]);

  useEffect(() => {
    const onResize = () => dispatch({ type: 'SET_W', payload: window.innerWidth });
    const mql = window.matchMedia('(max-width: 767px)');
    const onMql = () => dispatch({ type: 'SET_W', payload: window.innerWidth });
    onResize();
    window.addEventListener('resize', onResize);
    try { mql.addEventListener('change', onMql); } catch (_) {}
    return () => {
      window.removeEventListener('resize', onResize);
      try { mql.removeEventListener('change', onMql); } catch (_) {}
    };
  }, []);

  useEffect(() => {
    const hero = setInterval(() => {
      const n = Math.min(3, st.gallery.length);
      dispatch({ type: 'SET_HERO_IDX', payload: n ? (st.heroIdx + 1) % n : 0 });
    }, 3800);
    return () => clearInterval(hero);
  }, [st.gallery.length, st.heroIdx]);

  const d = computeDerived(st, go, openPokja, asyncDispatch);

  const handleLogout = () => {
    setConfirmModal({
      title: 'Keluar dari PENDESA-P3S?',
      description: 'Apakah Anda yakin ingin keluar dari akun Anda?',
      confirmLabel: 'Keluar',
      isDanger: false,
      onConfirm: () => {
        showToast('Anda telah keluar');
        document.cookie = 'silap_session=; path=/; max-age=0';
        dispatch({ type: 'LOGOUT' });
        setConfirmModal(null);
        window.scrollTo(0, 0);
      }
    });
  };



  return (
    <div className="silap-scroll" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f1f5f9', fontFamily: "'Inter', system-ui, sans-serif", color: '#1e293b', WebkitFontSmoothing: 'antialiased' }}>
      <style>{`@keyframes silapShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}@keyframes silapProgress{0%{width:0%}100%{width:90%}}@keyframes silapSpin{to{transform:rotate(360deg)}}button{cursor:pointer}button:not(:disabled):hover{opacity:.85}button:not(:disabled):active{opacity:.7}.silap-hover:hover{opacity:.85}.silap-hover:active{opacity:.7}`}</style>
      {/* HEADER */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '95%', margin: '0 auto', padding: d.rs.headerPad, display: 'flex', alignItems: 'center', columnGap: 'var(--silap-header-gap)', flexWrap: 'wrap', rowGap: 4 }}>
          <div onClick={() => go('beranda')} className="silap-hover" style={{ display: 'flex', alignItems: 'center', gap: 'var(--silap-logo-gap)', cursor: 'pointer', minWidth: 0 }}>
            <img src="./Logo1.png" alt="Logo Desa Bunutwetan" style={{ width: d.rs.logoSize, height: d.rs.logoSize, objectFit: 'contain' }} />
            <img src="./pkk.png" alt="Logo PKK" style={{ width: d.rs.logoSize, height: d.rs.logoSize, objectFit: 'contain' }} />
            <div style={{ lineHeight: 1.05 }}>
              <div style={{ fontSize: d.rs.logoFont, fontWeight: 800, letterSpacing: '-.02em', color: '#0f172a' }}>PENDESA-P3S</div>
              <div style={{ display: 'var(--silap-subtitle-display)' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748b', letterSpacing: '.02em' }}>Sistem Informasi Penguatan Desa Modul P3S Bunutwetan</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'var(--silap-d-nav-display)', alignItems: 'center', gap: 4, marginLeft: 14 }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {d.nav.map((item, i) => (
                <button key={i} onClick={item.onClick} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, padding: '9px 14px', background: item.bg, color: item.color, transition: 'background .15s' }}>{item.label}</button>
              ))}
            </nav>
          </div>

          <div style={{ display: 'var(--silap-d-nav-display)', marginLeft: 'auto', alignItems: 'center', gap: 10 }}>
            {!d.u && (
              <>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '12.5px', fontWeight: 600, color: '#94a3b8', background: '#f8fafc', padding: '7px 12px', border: '1px solid #e2e8f0' }}><span style={{ width: 7, height: 7, background: '#94a3b8' }}></span>Mode Warga</span>
                <button onClick={() => dispatch({ type: 'SET_SHOW_LOGIN', payload: true })} onMouseEnter={(e)=>{(e.currentTarget as HTMLElement).style.background='#152e4a'}} onMouseLeave={(e)=>{(e.currentTarget as HTMLElement).style.background='#1e3a5f'}} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: '10px 20px', background: '#1e3a5f', color: '#fff', boxShadow: '0 2px 8px rgba(30,58,95,0.15)' }}>Masuk</button>
              </>
            )}
            {d.u && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: '1px solid #e2e8f0', padding: '4px 5px 4px 12px' }}>
                <div style={{ textAlign: 'right', lineHeight: 1.15 }}><div style={{ fontSize: 13, fontWeight: 700 }}>{d.userVals.name}</div><div style={{ fontSize: '10.5px', fontWeight: 600, color: d.userVals.chipColor }}>{d.userVals.roleLabel}</div></div>
                <div onClick={() => dispatch({ type: 'SET_AVATAR_MODAL', payload: true })} className="silap-hover" title="Edit foto profil" style={{ cursor: 'pointer', width: 32, height: 32, overflow: 'hidden', flexShrink: 0, border: `2px solid ${d.userVals.chipColor}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{loading ? <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #cbd5e1', borderTopColor: '#64748b', borderRadius: '50%', animation: 'silapSpin .6s linear infinite' }}></span> : <div style={d.userVals.avatarStyleSm}>{d.userVals.avatarInitialSm}</div>}</div>
                <button onClick={handleLogout} title="Keluar" onMouseEnter={(e)=>{(e.currentTarget as HTMLElement).style.background='#e2e8f0'}} onMouseLeave={(e)=>{(e.currentTarget as HTMLElement).style.background='#f8fafc'}} style={{ border: 'none', cursor: 'pointer', background: '#f8fafc', color: '#475569', width: 32, height: 32, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⏻</button>
              </div>
            )}
          </div>

          <div style={{ display: 'var(--silap-m-nav-display)', marginLeft: 'auto', alignItems: 'center', gap: 8 }}>
            {d.u && <div onClick={() => dispatch({ type: 'SET_AVATAR_MODAL', payload: true })} className="silap-hover" style={{ cursor: 'pointer', width: 34, height: 34, overflow: 'hidden', border: `2px solid ${d.userVals.chipColor}`, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{loading ? <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #cbd5e1', borderTopColor: '#64748b', borderRadius: '50%', animation: 'silapSpin .6s linear infinite' }}></span> : <div style={d.userVals.avatarStyleSm}>{d.userVals.avatarInitialSm}</div>}</div>}
            {!d.u && <button onClick={() => dispatch({ type: 'SET_SHOW_LOGIN', payload: true })} onMouseEnter={(e)=>{(e.currentTarget as HTMLElement).style.background='#152e4a'}} onMouseLeave={(e)=>{(e.currentTarget as HTMLElement).style.background='#1e3a5f'}} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, padding: '8px 14px', background: '#1e3a5f', color: '#fff' }}>Masuk</button>}
            <button onClick={() => dispatch({ type: 'TOGGLE_MENU' })} onMouseEnter={(e)=>{(e.currentTarget as HTMLElement).style.background='#e2e8f0'}} onMouseLeave={(e)=>{(e.currentTarget as HTMLElement).style.background='#fff'}} style={{ border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', width: 38, height: 38, fontSize: 18, color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{st.menuOpen ? '✕' : '☰'}</button>
          </div>
        </div>

        {st.menuOpen && (
          <div style={{ borderTop: '1px solid #e2e8f0', background: '#fff', padding: '10px 16px 16px' }}>
            {d.nav.map((item, i) => (
              <button key={i} onClick={item.onMobile} style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, padding: '12px 14px', background: item.bg, color: item.color, display: 'block', marginBottom: 4 }}>{item.label}</button>
            ))}
            {d.u && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', padding: '12px 14px', marginTop: 6, marginBottom: 8 }}>
                  <div style={{ width: 38, height: 38, overflow: 'hidden', flexShrink: 0, border: `2px solid ${d.userVals.chipColor}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{loading ? <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #cbd5e1', borderTopColor: '#64748b', borderRadius: '50%', animation: 'silapSpin .6s linear infinite' }}></span> : <div style={d.userVals.avatarStyleSm}>{d.userVals.avatarInitialSm}</div>}</div>
                  <div><div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{d.userVals.name}</div><div style={{ fontSize: 12, color: d.userVals.chipColor, fontWeight: 600 }}>{d.userVals.roleLabel}</div></div>
                </div>
                <button onClick={handleLogout} style={{ width: '100%', border: '1px solid #e2e8f0', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: 11, background: '#fff', color: '#ef4444' }}>Keluar</button>
              </>
            )}
          </div>
        )}
      </header>

      <main style={{ flex: 1, width: '100%', maxWidth: '95%', margin: '0 auto', padding: st.route === 'pengumuman' ? '0' : d.rs.mainPad, display: 'flex', flexDirection: 'column' }}>
        {st.route === 'beranda' && <BerandaSection d={d} st={st} dispatch={asyncDispatch} go={go} openPokja={openPokja} showToast={showToast} />}
        {st.route === 'pokja' && <PokjaOverviewSection d={d} go={go} />}
        {st.route === 'detail' && <PokjaDetailSection d={d} st={st} dispatch={asyncDispatch} go={go} openPokja={openPokja} showToast={showToast} />}
        {st.route === 'galeri' && <GaleriSection d={d} st={st} dispatch={asyncDispatch} showToast={showToast} go={go} openPokja={openPokja} />}
        {st.route === 'pengumuman' && <PengumumanSection d={d} st={st} dispatch={asyncDispatch} showToast={showToast} go={go} openPokja={openPokja} />}
        {st.route === 'kalender' && <KalenderSection d={d} st={st} dispatch={asyncDispatch} showToast={showToast} />}
        {st.route === 'berkas' && (() => {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
              <BerkasSection d={d} st={st} dispatch={asyncDispatch} showToast={showToast} />
              {d.u && (() => {
                const isAdmin = d.u.role === 'admin';
                const canUploadBerkas = isAdmin || (d.u.pokja != null && st.fileFilter !== 'all' && d.u.pokja === st.fileFilter);
                return canUploadBerkas ? (
                  <div style={{ position: 'sticky', bottom: 28, alignSelf: 'flex-end' }}>
                    <button
                      onClick={() => asyncDispatch({ type: 'SET_FILE_MODAL', payload: { name: '', size: '' } })}
                      style={{
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        background: '#16a34a',
                        color: '#fff',
                        borderRadius: '50%',
                        width: 56,
                        height: 56,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(22,163,74,.4)',
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="11" y1="5" x2="11" y2="17" />
                        <line x1="5" y1="11" x2="17" y2="11" />
                      </svg>
                    </button>
                  </div>
                ) : null;
              })()}
            </div>
          );
        })()}
        {st.route === 'inovasi' && <InovasiSection d={d} st={st} dispatch={asyncDispatch} go={go} />}
        {st.route === 'editor' && <MilkdownProvider><EditorSection d={d} st={st} dispatch={asyncDispatch} go={go} showToast={showToast} /></MilkdownProvider>}
        {st.route === 'post' && <BlogPostSection d={d} st={st} dispatch={asyncDispatch} go={go} />}
        {st.route === 'laporan' && <LaporanSection d={d} st={st} dispatch={asyncDispatch} go={go} openPokja={openPokja} showToast={showToast} />}
        {st.route === 'dashboard' && d.u && <DashboardSection d={d} st={st} dispatch={asyncDispatch} go={go} openPokja={openPokja} showToast={showToast} />}
        {st.route === 'anggota-pkk' && d.u && d.u.role === 'admin' && <PKKMembersSection d={d} st={st} dispatch={asyncDispatch} go={go} openPokja={openPokja} showToast={showToast} />}
        {st.route === 'inventaris' && d.u && d.u.role === 'admin' && <InventarisSection d={d} st={st} dispatch={asyncDispatch} go={go} openPokja={openPokja} showToast={showToast} />}
        {st.route === 'surat' && d.u && d.u.role === 'admin' && <SuratSection d={d} st={st} dispatch={asyncDispatch} go={go} openPokja={openPokja} showToast={showToast} />}
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #e2e8f0', background: '#fff' }}>
        <div style={{ maxWidth: '95%', margin: '0 auto', padding: '22px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="./Logo1.png" alt="Logo Desa Bunutwetan" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            <div style={{ fontSize: '12.5px', color: '#64748b' }}>
              <strong style={{ color: '#334155' }}>Desa Bunutwetan</strong><br />Kecamatan Pakis · Kabupaten Malang
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#cbd5e1' }}>© 2026 Pemerintah Desa Bunutwetan. All Rights Reserved.</div>
        </div>
      </footer>

      {/* MODALS */}
      {st.showLogin && <LoginModal st={st} d={d} dispatch={asyncDispatch} showToast={showToast} />}
      {st.eventModal && <EventModal st={st} d={d} dispatch={asyncDispatch} showToast={showToast} />}
      {st.galModal && <GalModal st={st} d={d} dispatch={asyncDispatch} showToast={showToast} />}
      {st.fileModal && <FileUploadModal st={st} d={d} dispatch={asyncDispatch} showToast={showToast} />}
      {st.avatarModal && <AvatarModal st={st} d={d} dispatch={asyncDispatch} showToast={showToast} />}
      {st.userModal && <UserModal st={st} d={d} dispatch={asyncDispatch} showToast={showToast} />}
      {st.confirmDelete && <ConfirmDeleteModal st={st} d={d} dispatch={asyncDispatch} showToast={showToast} />}

      {confirmModal && (
        <div onClick={() => setConfirmModal(null)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'silapFade .2s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', maxWidth: 350, width: '100%', padding: 26, animation: 'silapPop .25s ease', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, background: confirmModal.isDanger ? '#fef2f2' : '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: confirmModal.isDanger ? '#ef4444' : '#1e3a5f', margin: '0 auto 14px' }}>
              {confirmModal.isDanger ? '⚠' : '⏻'}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>{confirmModal.title}</div>
            <div style={{ fontSize: '13.5px', color: '#94a3b8', marginBottom: 22, lineHeight: 1.5 }}>{confirmModal.description}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmModal(null)} style={{ flex: 1, border: '1px solid #e2e8f0', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: 12, background: '#fff', color: '#475569' }}>Batal</button>
              <button onClick={confirmModal.onConfirm} style={{ flex: 1.4, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: 12, background: confirmModal.isDanger ? '#ef4444' : '#1e3a5f', color: '#fff' }}>
                {confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {st.toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 99999, background: '#0f172a', color: '#fff', fontSize: '13.5px', fontWeight: 600, padding: '12px 20px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', animation: 'silapToast .25s ease', display: 'flex', alignItems: 'center', gap: 9, whiteSpace: 'nowrap' }}>
          <span style={{ color: '#22c55e' }}>✓</span>{st.toast}
        </div>
      )}
    </div>
  );
}
