'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { reducer, initialState, AppState, AppAction } from '@/lib/state';
import { computeDerived } from '@/lib/derived';
import { BerandaSection, PokjaOverviewSection, PokjaDetailSection, GaleriSection, LaporanSection, DashboardSection } from './Sections';
import { LoginModal, EventModal, GalModal, FileUploadModal, AvatarModal, UserModal, ConfirmDeleteModal } from './Modals';

export default function App() {
  const [st, dispatch] = useReducer<AppState, [AppAction]>(reducer, initialState);
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

  const d = computeDerived(st, go, openPokja, dispatch);

  const handleLogout = () => {
    showToast('Anda telah keluar');
    dispatch({ type: 'LOGOUT' });
    window.scrollTo(0, 0);
  };

  return (
    <div className="silap-scroll" style={{ minHeight: '100vh', background: '#eef3ec', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: '#1c2a21', WebkitFontSmoothing: 'antialiased' }}>
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

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: d.rs.mainPad }}>
        {st.route === 'beranda' && <BerandaSection d={d} st={st} dispatch={dispatch} go={go} openPokja={openPokja} showToast={showToast} />}
        {st.route === 'pokja' && <PokjaOverviewSection d={d} go={go} />}
        {st.route === 'detail' && <PokjaDetailSection d={d} st={st} dispatch={dispatch} go={go} openPokja={openPokja} showToast={showToast} />}
        {st.route === 'galeri' && <GaleriSection d={d} />}
        {st.route === 'laporan' && <LaporanSection d={d} st={st} dispatch={dispatch} go={go} openPokja={openPokja} showToast={showToast} />}
        {st.route === 'dashboard' && d.u && <DashboardSection d={d} st={st} dispatch={dispatch} go={go} openPokja={openPokja} showToast={showToast} />}
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
      {st.showLogin && <LoginModal st={st} d={d} dispatch={dispatch} showToast={showToast} />}
      {st.eventModal && <EventModal st={st} d={d} dispatch={dispatch} showToast={showToast} />}
      {st.galModal && <GalModal st={st} d={d} dispatch={dispatch} showToast={showToast} />}
      {st.fileModal && <FileUploadModal st={st} d={d} dispatch={dispatch} showToast={showToast} />}
      {st.avatarModal && <AvatarModal st={st} d={d} dispatch={dispatch} showToast={showToast} />}
      {st.userModal && <UserModal st={st} d={d} dispatch={dispatch} showToast={showToast} />}
      {st.confirmDelete && <ConfirmDeleteModal st={st} d={d} dispatch={dispatch} showToast={showToast} />}

      {/* TOAST */}
      {st.toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 80, background: '#16331f', color: '#fff', fontSize: '13.5px', fontWeight: 600, padding: '12px 20px', borderRadius: 13, boxShadow: '0 16px 40px -12px rgba(10,30,16,.6)', animation: 'silapToast .25s ease', display: 'flex', alignItems: 'center', gap: 9, whiteSpace: 'nowrap' }}>
          <span style={{ color: '#7fdca0' }}>✓</span>{st.toast}
        </div>
      )}
    </div>
  );
}
