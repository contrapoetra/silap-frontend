'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { reducer, initialState, AppState, AppAction } from '@/lib/state';
import { computeDerived } from '@/lib/derived';
import { BerandaSection, PokjaOverviewSection, PokjaDetailSection, GaleriSection, LaporanSection, DashboardSection } from './Sections';
import { LoginModal, EventModal, GalModal, FileUploadModal, AvatarModal, UserModal, ConfirmDeleteModal } from './Modals';
import { supabase } from '@/lib/supabase';

export default function App() {
  const [st, dispatch] = useReducer<AppState, [AppAction]>(reducer, initialState);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    isDanger?: boolean;
    onConfirm: () => void;
  } | null>(null);
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

  const openPokja = useCallback((id: number) => {
    dispatch({ type: 'OPEN_POKJA', payload: id });
    window.scrollTo(0, 0);
  }, []);

  // Load initial data and restore session on mount (once)
  useEffect(() => {
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
          supabase.from('gallery').select('*'),
          supabase.from('files').select('*'),
          supabase.from('reports').select('*'),
        ]);

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

        dispatch({
          type: 'SET_INITIAL_DATA',
          payload: {
            users: users || [],
            events: mappedEvents,
            gallery: gallery || [],
            files: files || [],
            reports: reports || [],
          },
        });

        // Restore saved session
        try {
          const savedUserId = localStorage.getItem('silap_user_id');
          if (savedUserId && users?.some((u: any) => u.id === savedUserId)) {
            dispatch({ type: 'DO_LOGIN', payload: savedUserId });
          }
        } catch (err) {
          console.warn('Failed to restore saved user session:', err);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        showToast('Terjadi kesalahan saat menghubungkan ke database');
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
    
    initApp();
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
          supabase.from('gallery').select('*'),
          supabase.from('files').select('*'),
          supabase.from('reports').select('*'),
        ]);

        const mappedEvents = (events || []).map((e: any) => ({
          id: e.id,
          pokja: e.pokja,
          y: e.year,
          m: e.month,
          d: e.day,
          title: e.title,
          time: e.time,
        }));

        dispatch({
          type: 'SET_INITIAL_DATA',
          payload: {
            users: users || [],
            events: mappedEvents,
            gallery: gallery || [],
            files: files || [],
            reports: reports || [],
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

  // Synchronize currentUserId with localStorage
  useEffect(() => {
    if (st.loading) return;
    try {
      if (st.currentUserId) {
        localStorage.setItem('silap_user_id', st.currentUserId);
      } else {
        localStorage.removeItem('silap_user_id');
      }
    } catch (err) {
      console.warn('LocalStorage is not accessible:', err);
    }
  }, [st.currentUserId, st.loading]);

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
            showToast('Gagal mengunggah foto: ' + error.message);
            return;
          }
          dispatch({ type: 'ADD_GALLERY', payload: { ...action.payload, id: data.id } });
          break;
        }
        case 'DELETE_GALLERY': {
          setConfirmModal({
            title: 'Hapus Foto?',
            description: 'Apakah Anda yakin ingin menghapus foto dari galeri ini? Tindakan ini tidak dapat dibatalkan.',
            confirmLabel: 'Hapus',
            isDanger: true,
            onConfirm: async () => {
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
        default:
          dispatch(action);
      }
    })();
  }, [st.reports, st.currentUserId, showToast]);

  useEffect(() => {
    const onResize = () => dispatch({ type: 'SET_W', payload: window.innerWidth });
    onResize();
    window.addEventListener('resize', onResize);
    const hero = setInterval(() => {
      const n = Math.min(3, st.gallery.length);
      dispatch({ type: 'SET_HERO_IDX', payload: n ? (st.heroIdx + 1) % n : 0 });
    }, 3800);
    return () => {
      window.removeEventListener('resize', onResize);
      clearInterval(hero);
      clearTimeout(toastTimer.current);
    };
  }, [st.gallery.length, st.heroIdx]);

  const d = computeDerived(st, go, openPokja, asyncDispatch);

  const handleLogout = () => {
    setConfirmModal({
      title: 'Keluar dari SILAP?',
      description: 'Apakah Anda yakin ingin keluar dari akun Anda?',
      confirmLabel: 'Keluar',
      isDanger: false,
      onConfirm: () => {
        showToast('Anda telah keluar');
        dispatch({ type: 'LOGOUT' });
        setConfirmModal(null);
        window.scrollTo(0, 0);
      }
    });
  };

  if (st.loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#eef3ec', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: '#1c2a21' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, background: 'rgba(255, 255, 255, 0.8)', padding: '40px 60px', borderRadius: 24, boxShadow: '0 20px 50px -15px rgba(22, 51, 31, 0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.5)' }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', border: '4px solid #e1eadf', borderTop: '4px solid #1f7e44', animation: 'silapSpin 1s linear infinite' }}></div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#16331f', margin: '0 0 4px', letterSpacing: '-0.02em' }}>SILAP</h1>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#6a8273', margin: 0 }}>Menghubungkan ke database...</p>
          </div>
        </div>
        <style>{`
          @keyframes silapSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="silap-scroll" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#eef3ec', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: '#1c2a21', WebkitFontSmoothing: 'antialiased' }}>
      {/* HEADER */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e1eadf' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: d.rs.headerPad, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div onClick={() => go('beranda')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}>
            <img src="./Logo1.png" alt="Logo Desa Bunutwetan" style={{ width: d.rs.logoSize, height: d.rs.logoSize, objectFit: 'contain' }} />
            <div style={{ lineHeight: 1.05 }}>
              <div style={{ fontSize: d.rs.logoFont, fontWeight: 800, letterSpacing: '-.02em', color: '#16331f' }}>SILAP</div>
              {d.isDesktop && <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#6a8273', letterSpacing: '.02em' }}>Sistem Informasi Layanan Program Desa</div>}
            </div>
          </div>

          {d.isDesktop && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 14 }}>
              {d.nav.map((item, i) => (
                <button key={i} onClick={item.onClick} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, padding: '9px 14px', borderRadius: 10, background: item.bg, color: item.color, transition: 'background .15s' }}>{item.label}</button>
              ))}
            </nav>
          )}

          {d.isDesktop && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
              {!d.u && (
                <>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '12.5px', fontWeight: 600, color: '#7d9385', background: '#f0f6ee', padding: '7px 12px', borderRadius: 99, border: '1px solid #e1eadf' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#8aa996' }}></span>Mode Warga</span>
                  <button onClick={() => dispatch({ type: 'SET_SHOW_LOGIN', payload: true })} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: '10px 20px', borderRadius: 11, background: '#1f7e44', color: '#fff', boxShadow: '0 6px 16px -7px rgba(31,126,68,.8)' }}>Masuk</button>
                </>
              )}
              {d.u && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: '1px solid #e1eadf', padding: '4px 5px 4px 12px', borderRadius: 99 }}>
                  <div style={{ textAlign: 'right', lineHeight: 1.15 }}><div style={{ fontSize: 13, fontWeight: 700 }}>{d.userVals.name}</div><div style={{ fontSize: '10.5px', fontWeight: 600, color: d.userVals.chipColor }}>{d.userVals.roleLabel}</div></div>
                  <div onClick={() => dispatch({ type: 'SET_AVATAR_MODAL', payload: true })} title="Edit foto profil" style={{ cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: `2px solid ${d.userVals.chipColor}` }}><div style={d.userVals.avatarStyleSm}>{d.userVals.avatarInitialSm}</div></div>
                  <button onClick={handleLogout} title="Keluar" style={{ border: 'none', cursor: 'pointer', background: '#f0f6ee', color: '#5b7264', width: 32, height: 32, borderRadius: '50%', fontSize: 15 }}>⏻</button>
                </div>
              )}
            </div>
          )}

          {d.isMob && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              {d.u && <div onClick={() => dispatch({ type: 'SET_AVATAR_MODAL', payload: true })} style={{ cursor: 'pointer', width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${d.userVals.chipColor}`, flexShrink: 0 }}><div style={d.userVals.avatarStyleSm}>{d.userVals.avatarInitialSm}</div></div>}
              {!d.u && <button onClick={() => dispatch({ type: 'SET_SHOW_LOGIN', payload: true })} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, padding: '8px 14px', borderRadius: 10, background: '#1f7e44', color: '#fff' }}>Masuk</button>}
              <button onClick={() => dispatch({ type: 'TOGGLE_MENU' })} style={{ border: '1px solid #e1eadf', background: '#fff', cursor: 'pointer', width: 38, height: 38, borderRadius: 11, fontSize: 18, color: '#5d7263', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{st.menuOpen ? '✕' : '☰'}</button>
            </div>
          )}
        </div>

        {st.menuOpen && d.isMob && (
          <div style={{ borderTop: '1px solid #e8efe6', background: '#fff', padding: '10px 16px 16px' }}>
            {d.nav.map((item, i) => (
              <button key={i} onClick={item.onMobile} style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, padding: '12px 14px', borderRadius: 11, background: item.bg, color: item.color, display: 'block', marginBottom: 4 }}>{item.label}</button>
            ))}
            {d.u && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f4f9f3', borderRadius: 12, padding: '12px 14px', marginTop: 6, marginBottom: 8 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: `2px solid ${d.userVals.chipColor}` }}><div style={d.userVals.avatarStyleSm}>{d.userVals.avatarInitialSm}</div></div>
                  <div><div style={{ fontSize: 14, fontWeight: 700, color: '#1a3322' }}>{d.userVals.name}</div><div style={{ fontSize: 12, color: d.userVals.chipColor, fontWeight: 600 }}>{d.userVals.roleLabel}</div></div>
                </div>
                <button onClick={handleLogout} style={{ width: '100%', border: '1px solid #e1eadf', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: 11, borderRadius: 11, background: '#fff', color: '#c0436c' }}>Keluar</button>
              </>
            )}
          </div>
        )}
      </header>

      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', padding: d.rs.mainPad }}>
        {st.route === 'beranda' && <BerandaSection d={d} st={st} dispatch={asyncDispatch} go={go} openPokja={openPokja} showToast={showToast} />}
        {st.route === 'pokja' && <PokjaOverviewSection d={d} go={go} />}
        {st.route === 'detail' && <PokjaDetailSection d={d} st={st} dispatch={asyncDispatch} go={go} openPokja={openPokja} showToast={showToast} />}
        {st.route === 'galeri' && <GaleriSection d={d} />}
        {st.route === 'laporan' && <LaporanSection d={d} st={st} dispatch={asyncDispatch} go={go} openPokja={openPokja} showToast={showToast} />}
        {st.route === 'dashboard' && d.u && <DashboardSection d={d} st={st} dispatch={asyncDispatch} go={go} openPokja={openPokja} showToast={showToast} />}
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #e1eadf', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '22px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="./Logo1.png" alt="Logo Desa Bunutwetan" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            <div style={{ fontSize: '12.5px', color: '#69806f' }}>
              <strong style={{ color: '#2a4031' }}>Desa Bunutwetan</strong><br />Kecamatan Pakis · Kabupaten Malang
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#9aa99e' }}>© 2026 Pemerintah Desa Bunutwetan. All Rights Reserved.</div>
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
        <div onClick={() => setConfirmModal(null)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(18,40,26,.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'silapFade .2s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, maxWidth: 350, width: '100%', padding: 26, animation: 'silapPop .25s ease', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: confirmModal.isDanger ? '#fbe7ee' : '#eaf6ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: confirmModal.isDanger ? '#c0436c' : '#1f7e44', margin: '0 auto 14px' }}>
              {confirmModal.isDanger ? '⚠' : '⏻'}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#16331f', marginBottom: 6 }}>{confirmModal.title}</div>
            <div style={{ fontSize: '13.5px', color: '#7d9385', marginBottom: 22, lineHeight: 1.5 }}>{confirmModal.description}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmModal(null)} style={{ flex: 1, border: '1px solid #dde7df', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: 12, borderRadius: 11, background: '#fff', color: '#5d7263' }}>Batal</button>
              <button onClick={confirmModal.onConfirm} style={{ flex: 1.4, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: 12, borderRadius: 11, background: confirmModal.isDanger ? '#c0436c' : '#1f7e44', color: '#fff' }}>
                {confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {st.toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 80, background: '#16331f', color: '#fff', fontSize: '13.5px', fontWeight: 600, padding: '12px 20px', borderRadius: 13, boxShadow: '0 16px 40px -12px rgba(10,30,16,.6)', animation: 'silapToast .25s ease', display: 'flex', alignItems: 'center', gap: 9, whiteSpace: 'nowrap' }}>
          <span style={{ color: '#7fdca0' }}>✓</span>{st.toast}
        </div>
      )}
    </div>
  );
}
