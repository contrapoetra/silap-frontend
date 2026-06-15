import { AppState, rlabel, raccent, rinit, canEditPokja, makeAvatarStyle } from './state';
import { POKJA, MONTHS, STATUS, EXT_TINT } from './constants';
import type { User } from './types';

export interface DerivedData {
  u: User | null;
  active: typeof POKJA[0];
  canEditActive: boolean;
  isMob: boolean;
  isDesktop: boolean;
  rs: Record<string, any>;
  heroCurrent: { caption: string; tag: string; pokjaName: string; accent: string };
  heroDots: { w: string; bg: string }[];
  userVals: Record<string, any>;
  nav: { label: string; onClick: () => void; onMobile: () => void; bg: string; color: string }[];
  pokjas: any[];
  features: any[];
  tabs: { label: string; onClick: () => void; bg: string; color: string; shadow: string }[];
  cal: { monthLabel: string; weekdays: string[]; cells: any[] };
  pokjaPhotos: any[];
  pokjaFiles: any[];
  galFilters: { label: string; onClick: () => void; bg: string; color: string; border: string }[];
  allPhotos: any[];
  reportRows: any[];
  dashStats: { value: number; label: string; accent: string }[];
  quickActions: any[];
  allUsers: any[];
  pokjaMemberList: any[];
  umV: Record<string, any>;
  avM: { hasPreview: boolean; displayStyle: React.CSSProperties; displayInitial: string };
  cdUser: { name: string };
  lf: Record<string, any>;
  demoAccounts: any[];
  fileModalV: { name: string; size: string; ext: string; tint: string; accent: string };
  eventModal: { title: string; time: string; dateLabel: string };
}

export function computeDerived(st: AppState, go: (r: string) => void, openPokja: (id: number) => void, dispatch: React.Dispatch<any>): DerivedData {
  const u = st.currentUserId ? st.users.find(x => x.id === st.currentUserId) ?? null : null;
  const active = POKJA.find(p => p.id === st.activePokja)!;
  const canEditActive = canEditPokja(u, st.activePokja);
  const isMob = st.w < 768;
  const isDesktop = !isMob;

  const rs: Record<string, any> = {
    headerPad: isMob ? '10px 16px' : '12px 24px',
    logoSize: isMob ? '36px' : '42px',
    logoFont: isMob ? '17px' : '19px',
    mainPad: isMob ? '0 16px 56px' : '0 24px 80px',
    hero: isMob ? { display: 'flex', flexDirection: 'column-reverse' as const, gap: '20px', padding: '24px 0 16px' } : { display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: '40px', alignItems: 'center', padding: '54px 0 40px' },
    heroImgH: isMob ? '220px' : '330px',
    heroTagMb: isMob ? '14px' : '22px',
    heroCapFont: isMob ? '15px' : '18px',
    h1: isMob ? { fontSize: '32px', lineHeight: '1.08', letterSpacing: '-.025em', fontWeight: '800', color: '#14301d', marginBottom: '14px' } : { fontSize: '50px', lineHeight: '1.04', letterSpacing: '-.03em', fontWeight: '800', color: '#14301d', marginBottom: '18px' },
    bodyFont: isMob ? '15px' : '17px',
    btnFont: isMob ? '14px' : '15px',
    btnPad: isMob ? '12px 20px' : '14px 26px',
    featGrid: { display: 'grid', gridTemplateColumns: isMob ? '1fr 1fr' : 'repeat(3,1fr)', gap: isMob ? '12px' : '16px' },
    cardPad: isMob ? '16px' : '20px',
    sectionGap: isMob ? '28px' : '46px',
    profilSec: { marginTop: isMob ? '28px' : '46px', display: 'grid', gridTemplateColumns: isMob ? '1fr' : '1fr 1fr', gap: isMob ? '16px' : '24px', background: '#fff', border: '1px solid #e3ebe1', borderRadius: '22px', padding: isMob ? '20px' : '30px' },
    profilH2: isMob ? '22px' : '26px',
    pokja4Grid: { display: 'grid', gridTemplateColumns: isMob ? '1fr 1fr' : 'repeat(4,1fr)', gap: isMob ? '12px' : '16px' },
    pokjaOverview: { display: 'grid', gridTemplateColumns: isMob ? '1fr' : '1fr 1fr', gap: '16px' },
    pokjaCardH: isMob ? '15px' : '18px',
    h2: isMob ? '18px' : '21px',
    pageH1: isMob ? '26px' : '32px',
    detailH1: isMob ? '20px' : '27px',
    tabFont: isMob ? '13px' : '14px',
    tabPad: isMob ? '8px 14px' : '9px 18px',
    editLabel: isMob ? 'Dapat edit' : 'Anda dapat mengedit',
    readLabel: isMob ? 'Lihat saja' : 'Hanya lihat',
    calPad: isMob ? '14px' : '22px',
    calGap: isMob ? '3px' : '7px',
    calCellPad: isMob ? '4px' : '8px',
    calMonthFont: isMob ? '16px' : '19px',
    calNumFont: isMob ? '11px' : '13px',
    calEvFont: isMob ? '9.5px' : '10.5px',
    galPokjaGrid: { display: 'grid', gridTemplateColumns: isMob ? '1fr 1fr' : 'repeat(3,1fr)', gap: isMob ? '12px' : '16px' },
    galGrid: { display: 'grid', gridTemplateColumns: isMob ? '1fr 1fr' : 'repeat(4,1fr)', gap: isMob ? '12px' : '16px' },
    laporanGrid: isMob ? { display: 'flex', flexDirection: 'column' as const, gap: '16px' } : { display: 'grid', gridTemplateColumns: '320px 1fr', gap: '22px', alignItems: 'start' },
    dashHeroPad: isMob ? '20px 18px' : '26px 28px',
    dashWelcome: isMob ? '20px' : '24px',
    dashStats: { display: 'grid', gridTemplateColumns: isMob ? '1fr 1fr' : 'repeat(3,1fr)', gap: isMob ? '12px' : '16px', marginBottom: isMob ? '16px' : '20px' },
    dashQA: { display: 'grid', gridTemplateColumns: isMob ? '1fr' : '1fr 1fr', gap: '10px' },
  };

  const heroPhotos = st.gallery.slice(0, 3).map(g => {
    const p = POKJA.find(x => x.id === g.pokja)!;
    return { caption: g.caption, tag: g.tag, pokjaName: p.name, accent: p.accent };
  });
  const hIdx = heroPhotos.length ? st.heroIdx % heroPhotos.length : 0;
  const heroCurrent = heroPhotos[hIdx] || { caption: 'Dokumentasi kegiatan PKK', tag: 'foto kegiatan', pokjaName: 'PKK', accent: '#2c9a55' };
  const heroDots = heroPhotos.map((_, i) => ({ w: i === hIdx ? '22px' : '7px', bg: i === hIdx ? '#fff' : 'rgba(255,255,255,.5)' }));

  const userVals = u ? {
    name: u.name, initial: rinit(u), roleLabel: rlabel(u), chipColor: raccent(u),
    avatarStyleSm: makeAvatarStyle(u.avatar, raccent(u), '30px', '12px', rinit(u)),
    avatarInitialSm: u.avatar ? '' : rinit(u),
    avatarStyleLg: u.avatar ? { width: '62px', height: '62px', borderRadius: '50%', backgroundImage: `url('${u.avatar}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : { width: '62px', height: '62px', borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#fff' },
    avatarInitialLg: u.avatar ? '' : rinit(u),
    scope: u.role === 'admin' ? 'Seluruh Pokja' : rlabel(u), isAdmin: u.role === 'admin', isKetua: u.role === 'ketua',
    accessNote: u.role === 'admin' ? 'Sebagai Admin Desa Anda dapat mengelola semua akun, kalender, galeri, berkas, dan status laporan.' : `Anda dapat mengedit kalender, galeri, dan berkas untuk ${rlabel(u).replace('Ketua ', '').replace('Anggota ', '')}. Pokja lain hanya dapat dilihat.`,
  } : {
    name: '', initial: '', roleLabel: '', chipColor: '#16331f',
    avatarStyleSm: makeAvatarStyle(null, '#16331f', '30px', '12px', ''),
    avatarInitialSm: '', avatarStyleLg: { width: '62px', height: '62px', borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#fff' },
    avatarInitialLg: '', scope: '', isAdmin: false, isKetua: false, accessNote: '',
  };

  const navDef = [
    { key: 'beranda', label: 'Beranda', route: 'beranda' },
    { key: 'pokja', label: 'Pokja', route: 'pokja' },
    { key: 'galeri', label: 'Galeri', route: 'galeri' },
    { key: 'laporan', label: 'Laporan', route: 'laporan' },
  ];
  if (u) navDef.push({ key: 'dashboard', label: 'Dashboard', route: 'dashboard' });
  const activeRoute = st.route === 'detail' ? 'pokja' : st.route;
  const nav = navDef.map(n => ({
    label: n.label,
    onClick: () => go(n.route),
    onMobile: () => { go(n.route); dispatch({ type: 'TOGGLE_MENU' }); },
    bg: activeRoute === n.route ? '#dff0e3' : 'transparent',
    color: activeRoute === n.route ? '#1f7e44' : '#5d7263',
  }));

  const pokjas = POKJA.map(p => ({
    ...p,
    count: st.events.filter(e => e.pokja === p.id).length,
    photoCount: st.gallery.filter(g => g.pokja === p.id).length,
    fileCount: st.files.filter(f => f.pokja === p.id).length,
    onOpen: () => openPokja(p.id),
  }));

  const features = [
    { glyph: '▤', title: 'Profil Desa', desc: 'Data desa & pengurus TP PKK.', accent: '#2c9a55', tint: '#e3f3e8', onClick: () => go('beranda') },
    { glyph: '◷', title: 'Kalender Kegiatan', desc: 'Agenda tiap pokja per bulan.', accent: '#3d7fd6', tint: '#e6effb', onClick: () => openPokja(1) },
    { glyph: '▦', title: 'Galeri', desc: 'Dokumentasi seluruh pokja.', accent: '#d9952f', tint: '#fbf1de', onClick: () => go('galeri') },
    { glyph: '✎', title: 'Laporan Warga', desc: 'Kirim laporan, rekap ke Excel.', accent: '#d05c84', tint: '#fbe7ee', onClick: () => go('laporan') },
    { glyph: '⬓', title: 'Berkas Pokja', desc: 'Unggah & unduh dokumen.', accent: '#2c9a55', tint: '#e3f3e8', onClick: () => openPokja(1) },
    { glyph: '⬚', title: '4 Kelompok Kerja', desc: 'Pokja I–IV PKK desa.', accent: '#3d7fd6', tint: '#e6effb', onClick: () => go('pokja') },
  ];

  const tabs = [
    { key: 'kalender', label: 'Kalender' },
    { key: 'galeri', label: 'Galeri' },
    { key: 'berkas', label: 'Berkas' },
  ].map(t => ({
    label: t.label,
    onClick: () => dispatch({ type: 'SET_TAB', payload: t.key }),
    bg: st.tab === t.key ? '#fff' : 'transparent',
    color: st.tab === t.key ? '#16331f' : '#6a8273',
    shadow: st.tab === t.key ? '0 2px 6px -2px rgba(0,0,0,.18)' : 'none',
  }));

  const first = new Date(st.calY, st.calM, 1);
  const startDow = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(st.calY, st.calM + 1, 0).getDate();
  const today = new Date();
  const cells: { dim?: boolean; day?: number }[] = [];
  for (let i = 0; i < startDow; i++) cells.push({ dim: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });
  while (cells.length % 7 !== 0) cells.push({ dim: true });

  const calCells = cells.map(c => {
    if (c.dim) return { day: '', bg: '#fafcf9', border: '#f0f4ef', numColor: '#ccc', cursor: 'default', onClick: () => {}, events: [], minH: isMob ? '48px' : '96px' };
    const dayNum = c.day!;
    const isToday = today.getFullYear() === st.calY && today.getMonth() === st.calM && today.getDate() === dayNum;
    const dayEvents = st.events.filter(e => e.pokja === st.activePokja && e.y === st.calY && e.m === st.calM && e.d === dayNum).map(e => ({
      title: e.title, time: e.time, accent: active.accent, tint: active.tint, canDelete: canEditActive,
      onDelete: (ev: React.MouseEvent) => { ev.stopPropagation(); dispatch({ type: 'DELETE_EVENT', payload: e.id }); },
    }));
    return {
      day: dayNum, bg: isToday ? '#eaf6ed' : '#fff', border: isToday ? active.accent : '#eef3ec',
      numColor: isToday ? active.accent : '#3a4f42', cursor: canEditActive ? 'pointer' : 'default',
      onClick: canEditActive ? () => dispatch({ type: 'SET_EVENT_MODAL', payload: { day: dayNum, title: '', time: '' } }) : () => {},
      events: dayEvents, minH: isMob ? '48px' : '96px',
    };
  });
  const cal = { monthLabel: MONTHS[st.calM] + ' ' + st.calY, weekdays: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'], cells: calCells };

  const pokjaPhotos = st.gallery.filter(g => g.pokja === st.activePokja).map(g => ({
    caption: g.caption, date: g.date, tag: g.tag, canDelete: canEditActive,
    onDelete: () => dispatch({ type: 'DELETE_GALLERY', payload: g.id }),
  }));

  const pokjaFiles = st.files.filter(f => f.pokja === st.activePokja).map(f => ({
    name: f.name, ext: f.ext, meta: `${f.size} · ${f.by} · ${f.date}`,
    tint: (EXT_TINT[f.ext] || EXT_TINT.PDF).tint, accent: (EXT_TINT[f.ext] || EXT_TINT.PDF).accent,
    canDelete: canEditActive,
    onDownload: () => {},
    onDelete: () => dispatch({ type: 'DELETE_FILE', payload: f.id }),
  }));

  const galFilterDef = [{ id: 'all' as const, label: 'Semua' }, ...POKJA.map(p => ({ id: p.id as number | 'all', label: p.name }))];
  const galFilters = galFilterDef.map(g => {
    const on = st.galFilter === g.id;
    const acc = g.id === 'all' ? '#1f7e44' : POKJA.find(p => p.id === g.id)!.accent;
    return { label: g.label, onClick: () => dispatch({ type: 'SET_GAL_FILTER', payload: g.id }), bg: on ? acc : '#fff', color: on ? '#fff' : '#5d7263', border: on ? acc : '#dde7df' };
  });

  const allPhotos = st.gallery.filter(g => st.galFilter === 'all' || g.pokja === st.galFilter).map(g => {
    const p = POKJA.find(x => x.id === g.pokja)!;
    return { caption: g.caption, date: g.date, tag: g.tag, pokjaName: p.name, accent: p.accent };
  });

  const reportRows = st.reports.map((r, i) => {
    const s = STATUS[r.status] || STATUS['Baru'];
    const canMod = !!(u && (u.role === 'admin' || u.role === 'ketua'));
    return {
      no: i + 1, date: r.date, name: r.name, contact: r.contact, pokja: r.pokja, desc: r.desc,
      status: r.status, rowBg: i % 2 ? '#fafcf9' : '#fff',
      statusBg: s.bg, statusColor: s.color, statusCursor: canMod ? 'pointer' : 'default',
      onStatus: canMod ? () => dispatch({ type: 'UPDATE_REPORT_STATUS', payload: r.id }) : () => {},
    };
  });

  const isAdmin = !!(u && u.role === 'admin');
  const scopeIds = isAdmin ? [1, 2, 3, 4] : (u && u.pokja ? [u.pokja] : []);
  const dashStats = [
    { value: st.events.filter(e => scopeIds.includes(e.pokja)).length, label: isAdmin ? 'Total kegiatan' : 'Kegiatan pokja Anda', accent: '#2c9a55' },
    { value: st.files.filter(f => scopeIds.includes(f.pokja)).length, label: isAdmin ? 'Total berkas' : 'Berkas pokja Anda', accent: '#3d7fd6' },
    { value: st.reports.filter(r => r.status === 'Baru').length, label: 'Laporan baru', accent: '#d05c84' },
  ];

  const quickActions = [
    { glyph: '◷', title: 'Kelola Kalender', desc: 'Tambah/hapus kegiatan', accent: '#2c9a55', tint: '#e3f3e8', onClick: () => { openPokja(scopeIds[0] || 1); } },
    { glyph: '▦', title: 'Kelola Galeri', desc: 'Unggah dokumentasi', accent: '#3d7fd6', tint: '#e6effb', onClick: () => { openPokja(scopeIds[0] || 1); setTimeout(() => dispatch({ type: 'SET_TAB', payload: 'galeri' }), 0); } },
    { glyph: '⬓', title: 'Kelola Berkas', desc: 'Unggah & unduh dokumen', accent: '#d9952f', tint: '#fbf1de', onClick: () => { openPokja(scopeIds[0] || 1); setTimeout(() => dispatch({ type: 'SET_TAB', payload: 'berkas' }), 0); } },
    { glyph: '✎', title: 'Tindak Lanjut Laporan', desc: 'Ubah status & export', accent: '#d05c84', tint: '#fbe7ee', onClick: () => go('laporan') },
  ];

  const roleBgMap: Record<string, string> = { admin: '#e3f3e8', ketua: '#e6effb', anggota: '#fbf1de' };
  const roleColorMap: Record<string, string> = { admin: '#1f7e44', ketua: '#3d7fd6', anggota: '#d9952f' };
  const allUsers = st.users.map((usr, i) => ({
    id: usr.id, name: usr.name, nikMasked: usr.nik.slice(0, 4) + '·····' + usr.nik.slice(-3),
    roleLabel: rlabel(usr), pokjaName: usr.pokja ? POKJA.find(p => p.id === usr.pokja)!.name : '—',
    initial: rinit(usr), accent: raccent(usr),
    avatarStyle: makeAvatarStyle(usr.avatar, raccent(usr), '28px', '10px', rinit(usr)),
    avatarInitial: usr.avatar ? '' : rinit(usr),
    roleBg: roleBgMap[usr.role] || '#f0f4ef', roleColor: roleColorMap[usr.role] || '#5d7263',
    rowBg: i % 2 ? '#fafcf9' : '#fff', canDelete: usr.id !== st.currentUserId,
    onEdit: () => dispatch({ type: 'SET_USER_MODAL', payload: { mode: 'edit', editId: usr.id, form: { nik: usr.nik, name: usr.name, password: '', role: usr.role, pokja: String(usr.pokja || '1') }, error: '' } }),
    onDelete: () => dispatch({ type: 'SET_CONFIRM_DELETE', payload: { userId: usr.id } }),
  }));

  const pokjaMemberList = u && u.role === 'ketua'
    ? st.users.filter(usr => usr.pokja === u.pokja && usr.role === 'anggota').map(usr => ({
      id: usr.id, name: usr.name, nikMasked: usr.nik.slice(0, 4) + '·····' + usr.nik.slice(-3),
      initial: rinit(usr), accent: raccent(usr),
      avatarStyle: makeAvatarStyle(usr.avatar, raccent(usr), '36px', '14px', rinit(usr)),
      avatarInitial: usr.avatar ? '' : rinit(usr),
    }))
    : [];

  const um = st.userModal;
  const umIsKetua = u && u.role === 'ketua';
  const umV = um ? {
    title: um.mode === 'add' ? (umIsKetua ? 'Tambah Anggota Pokja' : 'Tambah Akun Baru') : 'Edit Akun',
    saveLabel: um.mode === 'add' ? 'Buat Akun' : 'Simpan Perubahan',
    nik: um.form.nik, name: um.form.name, password: um.form.password,
    role: um.form.role, pokja: um.form.pokja, isEdit: um.mode === 'edit',
    pwdHint: um.mode === 'edit' ? '(kosongkan jika tidak diubah)' : 'Buat password',
    showRoleSelect: !!(u && u.role === 'admin'),
    showPokjaSelect: !!(u && u.role === 'admin' && (um.form.role === 'ketua' || um.form.role === 'anggota')),
    error: um.error || '', hasError: !!(um.error),
  } : { title: '', saveLabel: 'Simpan', nik: '', name: '', password: '', role: 'anggota', pokja: '1', isEdit: false, pwdHint: '', showRoleSelect: false, showPokjaSelect: false, error: '', hasError: false };

  let avDisplayStyle: React.CSSProperties, avDisplayInitial = '';
  if (st.avatarPreview) {
    avDisplayStyle = { width: '100px', height: '100px', borderRadius: '50%', backgroundImage: `url('${st.avatarPreview}')`, backgroundSize: 'cover', backgroundPosition: 'center' };
  } else if (u && u.avatar) {
    avDisplayStyle = { width: '100px', height: '100px', borderRadius: '50%', backgroundImage: `url('${u.avatar}')`, backgroundSize: 'cover', backgroundPosition: 'center' };
  } else {
    const avAcc = u ? raccent(u) : '#2c9a55';
    avDisplayStyle = { width: '100px', height: '100px', borderRadius: '50%', background: avAcc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: '800', color: '#fff' };
    avDisplayInitial = u ? rinit(u) : '?';
  }
  const avM = { hasPreview: !!st.avatarPreview, displayStyle: avDisplayStyle, displayInitial: avDisplayInitial };

  const cdU = st.confirmDelete ? st.users.find(x => x.id === st.confirmDelete!.userId) : null;
  const cdUser = { name: cdU ? cdU.name : '' };
  const lf = { ...st.loginForm, hasError: !!(st.loginForm.error), demoLabel: st.loginForm.showDemo ? 'Sembunyikan akun demo' : 'Lihat akun demo' };
  const demoAccounts = st.users.map(usr => ({ name: usr.name, nik: usr.nik, password: usr.password, roleLabel: rlabel(usr), initial: rinit(usr), accent: raccent(usr) }));

  const fmRaw = st.fileModal;
  const fmExt = fmRaw && fmRaw.name ? (/\.xlsx?$/i.test(fmRaw.name) ? 'XLS' : /\.docx?$/i.test(fmRaw.name) ? 'DOC' : 'PDF') : 'PDF';
  const fileModalV = { name: fmRaw ? (fmRaw.name || '') : '', size: fmRaw ? (fmRaw.size || '') : '', ext: fmExt, tint: EXT_TINT[fmExt]!.tint, accent: EXT_TINT[fmExt]!.accent };
  const eventModal = st.eventModal ? { title: st.eventModal.title, time: st.eventModal.time, dateLabel: `${st.eventModal.day} ${MONTHS[st.calM]} ${st.calY}` } : { title: '', time: '', dateLabel: '' };

  return {
    u, active, canEditActive, isMob, isDesktop, rs,
    heroCurrent, heroDots, userVals, nav, pokjas, features, tabs, cal,
    pokjaPhotos, pokjaFiles, galFilters, allPhotos, reportRows,
    dashStats, quickActions, allUsers, pokjaMemberList, umV, avM, cdUser, lf, demoAccounts, fileModalV, eventModal,
  };
}
