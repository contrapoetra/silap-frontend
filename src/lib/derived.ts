import { AppState, rlabel, raccent, rinit, canEditPokja, makeAvatarStyle } from './state';
import { POKJA, MONTHS, MONTH_ABBR, MONTH_NAMES_SHORT, STATUS, EXT_TINT } from './constants';
import type { User, BlogPost, OrgPosition, InventoryItem, SuratItem, PengumumanItem, GalleryItem } from './types';

function sortGallery(gallery: GalleryItem[], sort: 'date' | 'name' | 'pokja') {
  const items = [...gallery];
  if (sort === 'name') {
    items.sort((a, b) => a.caption.localeCompare(b.caption));
  } else if (sort === 'pokja') {
    items.sort((a, b) => a.pokja - b.pokja);
  }
  if (sort === 'date') {
    items.sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    });
  }
  return items;
}

export interface DerivedData {
  u: User | null;
  active: typeof POKJA[0];
  canEditActive: boolean;
  isMob: boolean;
  isDesktop: boolean;
  rs: Record<string, any>;
  heroCurrent: { image: string | null | undefined; caption: string; tag: string; pokjaName: string; accent: string };
  heroDots: { w: string; bg: string; onClick: () => void }[];
  userVals: Record<string, any>;
  nav: { label: string; onClick: () => void; onMobile: () => void; bg: string; color: string }[];
  pokjas: any[];
  features: any[];
  tabs: { label: string; onClick: () => void; bg: string; color: string; shadow: string }[];
  cal: { monthLabel: string; weekdays: string[]; cells: any[] };
  pokjaPhotos: any[];
  pokjaFiles: any[];
  galFilters: { label: string; onClick: () => void; bg: string; color: string; border: string }[];
  galSortOptions: { label: string; onClick: () => void; active: boolean }[];
  allPhotos: any[];
  galSections: { label: string; photos: any[] }[];
  berkasFilters: { label: string; onClick: () => void; bg: string; color: string; border: string }[];
  allFiles: any[];
  reportGroups: any[];
  dashStats: { value: number; label: string; accent: string }[];
  quickActions: any[];
  allUsers: any[];
  pokjaMemberList: any[];
  pkkMembers: any[];
  inventory: any[];
  suratMasuk: any[];
  suratKeluar: any[];
  suratView: 'masuk' | 'keluar';
  blogPosts: BlogPost[];
  orgPositions: OrgPosition[];
  pengumuman: PengumumanItem[];
  umV: Record<string, any>;
  avM: { hasPreview: boolean; displayStyle: React.CSSProperties; displayInitial: string };
  cdUser: { name: string };
  lf: Record<string, any>;
  demoAccounts: any[];
  fileModalV: { name: string; size: string; ext: string; tint: string; accent: string };
  eventModal: { title: string; time: string; dateLabel: string };
}

export function computeDerived(st: AppState, go: (r: string) => void, openPokja: (p: { pokja: number; tab?: string }) => void, dispatch: React.Dispatch<any>): DerivedData {
  const u = st.currentUserId ? st.users.find(x => x.id === st.currentUserId) ?? null : null;
  const active = POKJA.find(p => p.id === st.activePokja)!;
  const canEditActive = canEditPokja(u, st.activePokja);
  const isMob = st.w < 768;
  const isDesktop = !isMob;

  const rs: Record<string, any> = {
    headerPad: isMob ? '10px 16px' : '12px 20px',
    logoSize: isMob ? '36px' : '42px',
    logoFont: isMob ? '17px' : '19px',
    mainPad: isMob ? '0 16px 56px' : '0 20px 80px',
    hero: isMob ? { display: 'flex', flexDirection: 'column-reverse' as const, gap: '20px', padding: '24px 0 16px' } : { display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: '40px', alignItems: 'center', padding: '54px 0 40px' },
    heroImgH: isMob ? '220px' : '330px',
    heroTagMb: isMob ? '14px' : '22px',
    heroCapFont: isMob ? '15px' : '18px',
    h1: isMob ? { fontSize: '32px', lineHeight: '1.08', letterSpacing: '-.025em', fontWeight: '800', color: '#0f172a', marginBottom: '14px' } : { fontSize: '50px', lineHeight: '1.04', letterSpacing: '-.03em', fontWeight: '800', color: '#0f172a', marginBottom: '18px' },
    bodyFont: isMob ? '15px' : '17px',
    btnFont: isMob ? '14px' : '15px',
    btnPad: isMob ? '12px 20px' : '14px 26px',
    featGrid: { display: 'grid', gridTemplateColumns: isMob ? '1fr 1fr' : 'repeat(3,1fr)', gap: isMob ? '12px' : '16px' },
    cardPad: isMob ? '16px' : '20px',
    sectionGap: isMob ? '28px' : '46px',
    profilSec: { marginTop: isMob ? '28px' : '46px', display: 'grid', gridTemplateColumns: isMob ? '1fr' : '1fr 1fr', gap: isMob ? '16px' : '24px', background: '#fff', border: '1px solid #e2e8f0', padding: isMob ? '20px' : '30px' },
    profilH2: isMob ? '22px' : '26px',
    pokja4Grid: { display: 'grid', gridTemplateColumns: isMob ? '1fr 1fr' : 'repeat(4,1fr)', gap: isMob ? '12px' : '16px' },
    pokjaOverview: { display: 'grid', gridTemplateColumns: isMob ? '1fr' : '1fr 1fr', gap: isMob ? '16px' : '24px', alignItems: 'start' },
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

  const heroPhotos = sortGallery(st.gallery, 'date').slice(0, 3).map(g => {
    const p = POKJA.find(x => x.id === g.pokja) || { name: 'Umum', accent: '#059669' };
    return { image: g.image, caption: g.caption, tag: g.tag, pokjaName: p.name, accent: p.accent };
  });
  const hIdx = heroPhotos.length ? st.heroIdx % heroPhotos.length : 0;
  const heroCurrent = heroPhotos[hIdx] || { image: null, caption: 'Dokumentasi kegiatan PKK', tag: 'foto kegiatan', pokjaName: 'PKK', accent: '#2563eb' };
  const heroDots = heroPhotos.map((_, i) => ({ w: i === hIdx ? '22px' : '7px', bg: i === hIdx ? '#fff' : 'rgba(255,255,255,.5)', onClick: () => dispatch({ type: 'SET_HERO_IDX', payload: i }) }));

  const userVals = u ? {
    name: u.name, initial: rinit(u), roleLabel: rlabel(u), chipColor: raccent(u),
    avatarStyleSm: makeAvatarStyle(u.avatar, raccent(u), '30px', '12px', rinit(u)),
    avatarInitialSm: u.avatar ? '' : rinit(u),
    avatarStyleLg: u.avatar ? { width: '62px', height: '62px', borderRadius: '50%', backgroundImage: `url('${u.avatar}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : { width: '62px', height: '62px', borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#fff' },
    avatarInitialLg: u.avatar ? '' : rinit(u),
    scope: u.role === 'admin' ? 'Seluruh Pokja' : rlabel(u), isAdmin: u.role === 'admin', isKetua: u.role === 'ketua',
    accessNote: u.role === 'admin' ? 'Sebagai Admin Desa Anda dapat mengelola semua akun, kalender, galeri, berkas, dan status laporan.' : `Anda dapat mengedit kalender, galeri, dan berkas untuk ${rlabel(u).replace('Ketua ', '').replace('Anggota ', '')}. Pokja lain hanya dapat dilihat.`,
  } : {
    name: '', initial: '', roleLabel: '', chipColor: '#0f172a',
    avatarStyleSm: makeAvatarStyle(null, '#0f172a', '30px', '12px', ''),
    avatarInitialSm: '', avatarStyleLg: { width: '62px', height: '62px', borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#fff' },
    avatarInitialLg: '', scope: '', isAdmin: false, isKetua: false, accessNote: '',
  };

  const navDef = [
    { key: 'beranda', label: 'Beranda', route: 'beranda' },
    { key: 'pokja', label: 'PKK', route: 'pokja' },
    { key: 'galeri', label: 'Galeri', route: 'galeri' },
    { key: 'pengumuman', label: 'Pengumuman', route: 'pengumuman' },
    { key: 'inovasi', label: 'Inovasi', route: 'inovasi' },
    { key: 'kalender', label: 'Kalender', route: 'kalender' },
    { key: 'laporan', label: 'Laporan', route: 'laporan' },
  ];
  if (u) navDef.push({ key: 'dashboard', label: 'Akun', route: 'dashboard' });
  if (u && u.role === 'admin') navDef.push({ key: 'anggota-pkk', label: 'Anggota PKK', route: 'anggota-pkk' });
  if (u && u.role === 'admin') navDef.push({ key: 'inventaris', label: 'Inventaris', route: 'inventaris' });
  if (u && u.role === 'admin') navDef.push({ key: 'surat', label: 'Surat', route: 'surat' });
  if (u && u.role === 'admin') navDef.push({ key: 'berkas', label: 'Berkas', route: 'berkas' });
  const activeRoute = st.route === 'detail' ? 'pokja' : st.route;
  const nav = navDef.map(n => ({
    label: n.label,
    onClick: () => go(n.route),
    onMobile: () => { go(n.route); dispatch({ type: 'TOGGLE_MENU' }); },
    bg: activeRoute === n.route ? '#e0e7ff' : 'transparent',
    color: activeRoute === n.route ? '#1e3a5f' : '#475569',
  }));

  const pokjas = POKJA.map(p => ({
    ...p,
    count: st.events.filter(e => e.pokja === p.id).length,
    photoCount: st.gallery.filter(g => g.pokja === p.id).length,
    fileCount: st.files.filter(f => f.pokja === p.id).length,
    onOpen: () => openPokja({ pokja: p.id }),
  }));

  const features = [
    { glyph: '▤', title: 'Profil Desa', desc: 'Data desa & pengurus TP PKK.',     accent: '#2563eb', tint: '#eff6ff', onClick: () => { go('beranda'); setTimeout(() => document.getElementById('profil-desa')?.scrollIntoView({ behavior: 'smooth' }), 100); } },
    { glyph: '◷', title: 'Kalender Kegiatan', desc: 'Agenda tiap pokja per bulan.', accent: '#7c3aed', tint: '#f3e8ff', onClick: () => go('kalender') },
    { glyph: '▦', title: 'Galeri', desc: 'Dokumentasi seluruh pokja.', accent: '#ea580c', tint: '#fff7ed', onClick: () => go('galeri') },
    { glyph: '✎', title: 'Laporan Warga', desc: 'Kirim laporan, rekap ke Excel.', accent: '#0891b2', tint: '#ecfeff', onClick: () => go('laporan') },
    { glyph: '⬓', title: 'Berkas Pokja', desc: 'Unggah & unduh dokumen.', accent: '#2563eb', tint: '#eff6ff', onClick: () => openPokja({ pokja: 1, tab: 'berkas' }) },
    { glyph: '⬚', title: '4 Kelompok Kerja', desc: 'Pokja I–IV PKK desa.', accent: '#7c3aed', tint: '#f3e8ff', onClick: () => go('pokja') },
  ];

  const tabs = [
    { key: 'profil', label: 'Profil' },
    { key: 'kalender', label: 'Kalender' },
    { key: 'galeri', label: 'Galeri' },
    { key: 'berkas', label: 'Berkas' },
  ].map(t => ({
    label: t.label,
    onClick: () => dispatch({ type: 'SET_TAB', payload: t.key }),
    bg: st.tab === t.key ? '#fff' : 'transparent',
    color: st.tab === t.key ? '#0f172a' : '#64748b',
    shadow: st.tab === t.key ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
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
    if (c.dim) return { day: '', bg: '#f8fafc', border: '#f1f5f9', numColor: '#ccc', cursor: 'default', onClick: () => {}, events: [], minH: isMob ? '48px' : '96px' };
    const dayNum = c.day!;
    const isToday = today.getFullYear() === st.calY && today.getMonth() === st.calM && today.getDate() === dayNum;
    const dayEvents = st.events.filter(e => e.pokja === st.activePokja && e.y === st.calY && e.m === st.calM && e.d === dayNum).map(e => ({
      id: e.id, title: e.title, time: e.time, accent: active.accent, tint: active.tint, canEdit: canEditActive,
      onClick: (ev: React.MouseEvent) => { ev.stopPropagation(); if (canEditActive) dispatch({ type: 'SET_EVENT_MODAL', payload: { day: dayNum, title: e.title, time: e.time, id: e.id, pokja: st.activePokja } }); },
      onDelete: (ev: React.MouseEvent) => { ev.stopPropagation(); dispatch({ type: 'DELETE_EVENT', payload: e.id }); },
    }));
    return {
      day: dayNum, bg: isToday ? '#eef2ff' : '#fff', border: isToday ? active.accent : '#e2e8f0',
      numColor: isToday ? active.accent : '#334155', cursor: canEditActive ? 'pointer' : 'default',
      onClick: canEditActive ? () => dispatch({ type: 'SET_EVENT_MODAL', payload: { day: dayNum, title: '', time: '', pokja: st.activePokja } }) : () => {},
      events: dayEvents, minH: isMob ? '48px' : '96px',
    };
  });
  const cal = { monthLabel: MONTHS[st.calM] + ' ' + st.calY, weekdays: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'], cells: calCells };

  const pokjaPhotos = sortGallery(st.gallery.filter(g => g.pokja === st.activePokja), st.galSort).map(g => ({
    caption: g.caption, date: g.date, tag: g.tag, image: g.image, created_at: g.created_at, canDelete: canEditActive,
    onDelete: () => dispatch({ type: 'DELETE_GALLERY', payload: g.id }),
  }));

  const pokjaFiles = st.files.filter(f => f.pokja === st.activePokja).map(f => ({
    name: f.name, ext: f.ext, meta: `${f.size} · ${f.by} · ${f.date}`,
    tint: (EXT_TINT[f.ext] || EXT_TINT.PDF).tint, accent: (EXT_TINT[f.ext] || EXT_TINT.PDF).accent,
    canDelete: canEditActive, url: f.url,
    onDelete: () => dispatch({ type: 'DELETE_FILE', payload: f.id }),
  }));

  const GAL_UMUM = { id: 5, name: 'Umum', accent: '#059669', tint: '#ecfdf5' };
  const galFilterDef = [{ id: 'all' as const, label: 'Semua' }, ...POKJA.map(p => ({ id: p.id as number | 'all', label: p.name })), { id: GAL_UMUM.id as number | 'all', label: GAL_UMUM.name }];
  const galFilters = galFilterDef.map(g => {
    const on = st.galFilter === g.id;
    const acc = g.id === 'all' ? '#1e3a5f' : g.id === GAL_UMUM.id ? GAL_UMUM.accent : POKJA.find(p => p.id === g.id)!.accent;
    return { label: g.label, onClick: () => dispatch({ type: 'SET_GAL_FILTER', payload: g.id }), bg: on ? acc : '#fff', color: on ? '#fff' : '#475569', border: on ? acc : '#e2e8f0' };
  });

  const sortDefs = [
    { key: 'date' as const, label: 'Tanggal' },
    { key: 'name' as const, label: 'Nama' },
    { key: 'pokja' as const, label: 'Pokja' },
  ];
  const galSortOptions = sortDefs.map(s => ({
    label: s.label,
    active: st.galSort === s.key,
    onClick: () => dispatch({ type: 'SET_GAL_SORT', payload: s.key }),
  }));

  const allPhotos = sortGallery(st.gallery.filter(g => st.galFilter === 'all' || g.pokja === st.galFilter), st.galSort).map(g => {
    const p = g.pokja === GAL_UMUM.id ? GAL_UMUM : POKJA.find(x => x.id === g.pokja)!;
    return { id: g.id, caption: g.caption, date: g.date, tag: g.tag, image: g.image, pokjaName: p.name, accent: p.accent, created_at: g.created_at };
  });

  const galSections = (() => {
    const groups = new Map<string, { label: string; photos: typeof allPhotos }>();
    for (const p of allPhotos) {
      const d = p.created_at ? new Date(p.created_at) : null;
      const key = d ? `${d.getFullYear()}-${d.getMonth()}` : '__none';
      const label = d ? `${MONTHS[d.getMonth()]} ${d.getFullYear()}` : 'Tanpa tanggal';
      if (!groups.has(key)) groups.set(key, { label, photos: [] });
      groups.get(key)!.photos.push(p);
    }
    return [...groups.entries()]
      .sort(([a], [b]) => a === '__none' ? 1 : b === '__none' ? -1 : b.localeCompare(a))
      .map(([_, v]) => v);
  })();

  const berkasFilterDef = [{ id: 'all' as const, label: 'Semua' }, ...POKJA.map(p => ({ id: p.id as number | 'all', label: p.name }))];
  const berkasFilters = berkasFilterDef.map(g => {
    const on = st.fileFilter === g.id;
    const acc = g.id === 'all' ? '#1e3a5f' : POKJA.find(p => p.id === g.id)!.accent;
    return { label: g.label, onClick: () => dispatch({ type: 'SET_FILE_FILTER', payload: g.id }), bg: on ? acc : '#fff', color: on ? '#fff' : '#475569', border: on ? acc : '#e2e8f0' };
  });
  const allFiles = st.files.filter(f => st.fileFilter === 'all' || f.pokja === st.fileFilter).map(f => {
    const p = POKJA.find(x => x.id === f.pokja)!;
    return { ...f, pokjaName: p.name, accent: p.accent };
  }).reverse();

  const userPokjaName = u && u.role !== 'admin' && u.pokja ? POKJA.find(p => p.id === u.pokja)!.name : null;
  const visibleReports = userPokjaName ? st.reports.filter(r => r.pokja === userPokjaName) : st.reports;

  const reportGroups = (() => {
    const map: Record<string, any[]> = {};
    visibleReports.forEach((r) => {
      const s = STATUS[r.status] || STATUS['Baru'];
      const canMod = !!(u && (u.role === 'admin' || u.role === 'ketua'));
      const row = {
        id: r.id, date: r.date, name: r.name, contact: r.contact, pokja: r.pokja, desc: r.desc,
        status: r.status,
        statusBg: s.bg, statusColor: s.color, statusCursor: canMod ? 'pointer' : 'default',
        onStatus: canMod ? () => dispatch({ type: 'UPDATE_REPORT_STATUS', payload: r.id }) : () => {},
      };
      const parts = r.date.split(' ');
      const monthName = parts.length >= 3 ? MONTH_ABBR[parts[1]] : undefined;
      const key = monthName ? `${monthName} ${parts[2]}` : 'Lainnya';
      if (!map[key]) map[key] = [];
      map[key].push(row);
    });
    return Object.entries(map).map(([monthLabel, rows]) => {
      const parts = rows[0]?.date.split(' ') || [];
      const mIdx = parts.length >= 3 ? MONTHS.indexOf(MONTH_ABBR[parts[1]] || '') : -1;
      const sortKey = mIdx >= 0 ? `${parts[2]}-${String(mIdx + 1).padStart(2, '0')}` : '0000-00';
      return {
        monthLabel,
        sortKey,
        reports: rows.map((r: any, i: number) => ({ ...r, no: i + 1 })),
      };
    }).sort((a, b) => b.sortKey.localeCompare(a.sortKey));
  })();

  const isAdmin = !!(u && u.role === 'admin');
  const scopeIds = isAdmin ? [1, 2, 3, 4] : (u && u.pokja ? [u.pokja] : []);
  const dashStats = [
    { value: st.events.filter(e => scopeIds.includes(e.pokja)).length, label: isAdmin ? 'Total kegiatan' : 'Kegiatan pokja Anda', accent: '#2563eb' },
    { value: st.files.filter(f => scopeIds.includes(f.pokja)).length, label: isAdmin ? 'Total berkas' : 'Berkas pokja Anda', accent: '#7c3aed' },
    { value: visibleReports.filter(r => r.status === 'Baru').length, label: 'Laporan baru', accent: '#ef4444' },
  ];

  const quickActions = [
    { glyph: '◷', title: 'Kelola Kalender', desc: 'Tambah/hapus kegiatan', accent: '#2563eb', tint: '#eff6ff', onClick: () => { openPokja({ pokja: scopeIds[0] || 1, tab: 'kalender' }); } },
    { glyph: '▦', title: 'Kelola Galeri', desc: 'Unggah dokumentasi', accent: '#7c3aed', tint: '#f3e8ff', onClick: () => { if (isAdmin) { go('galeri'); } else { openPokja({ pokja: scopeIds[0] || 1, tab: 'galeri' }); } } },
    { glyph: '⬓', title: 'Kelola Berkas', desc: 'Unggah & unduh dokumen', accent: '#ea580c', tint: '#fff7ed', onClick: () => { openPokja({ pokja: scopeIds[0] || 1, tab: 'berkas' }); } },
    { glyph: '✎', title: 'Tindak Lanjut Laporan', desc: 'Ubah status & export', accent: '#0891b2', tint: '#ecfeff', onClick: () => go('laporan') },
    { glyph: '▤', title: 'Kelola Inventaris', desc: 'Data barang inventaris', accent: '#059669', tint: '#ecfdf5', onClick: () => go('inventaris') },
    { glyph: '✉', title: 'Kelola Surat', desc: 'Surat masuk & keluar', accent: '#d97706', tint: '#fffbeb', onClick: () => go('surat') },
    { glyph: '📢', title: 'Pengumuman', desc: 'Informasi & pengumuman', accent: '#059669', tint: '#ecfdf5', onClick: () => go('pengumuman') },
  ];

  const roleBgMap: Record<string, string> = { admin: '#e0e7ff', ketua: '#f3e8ff', anggota: '#fffbeb' };
  const roleColorMap: Record<string, string> = { admin: '#1e3a5f', ketua: '#7c3aed', anggota: '#f59e0b' };
  const allUsers = st.users.map((usr, i) => ({
    id: usr.id, name: usr.name, nikMasked: usr.nik.slice(0, 4) + '·····' + usr.nik.slice(-3),
    roleLabel: rlabel(usr), pokjaName: usr.pokja ? POKJA.find(p => p.id === usr.pokja)!.name : '—',
    initial: rinit(usr), accent: raccent(usr),
    avatarStyle: makeAvatarStyle(usr.avatar, raccent(usr), '28px', '10px', rinit(usr)),
    avatarInitial: usr.avatar ? '' : rinit(usr),
    roleBg: roleBgMap[usr.role] || '#f1f5f9', roleColor: roleColorMap[usr.role] || '#475569',
    rowBg: i % 2 ? '#f8fafc' : '#fff', canDelete: usr.id !== st.currentUserId,
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

  const pkkMembers = (st.pkkMembers || []).map((m, i) => ({
    id: m.id, name: m.name,
    nikMasked: m.nik ? m.nik.slice(0, 4) + '·····' + m.nik.slice(-3) : '',
    pokjaName: m.pokja ? POKJA.find(p => p.id === m.pokja)?.name || '—' : '—',
    position: m.position, address: m.address, phone: m.phone || '',
    gender: m.gender || '', birth_place: m.birth_place || '',
    birth_date: m.birth_date || '', marital_status: m.marital_status || '',
    education: m.education || '', occupation: m.occupation || '',
    membership_status: m.membership_status || '',
    rowBg: i % 2 ? '#f8fafc' : '#fff',
  }));

  function flattenTree(items: any[]): any[] {
    const result: any[] = [];
    for (const m of items) {
      result.push({
        id: m.id, nama_barang: m.nama_barang, asal_barang: m.asal_barang || '',
        jumlah: m.jumlah || 0, tempat_penyimpanan: m.tempat_penyimpanan || '',
        kondisi_barang: m.kondisi_barang || '',
        hasChildren: !!(m.children && m.children.length),
      });
      if (m.children) result.push(...flattenTree(m.children));
    }
    return result;
  }
  const inventory = flattenTree(st.inventory || []);

  const suratMasuk = (st.surat || []).filter(s => s.type === 'masuk').map((m, i) => ({
    id: m.id, type: m.type,
    tanggal_terima: m.tanggal_terima || '',
    tanggal_surat: m.tanggal_surat || '',
    nomor_surat: m.nomor_surat || '',
    asal_surat_dari: m.asal_surat_dari || '',
    perihal: m.perihal || '',
    lampiran: m.lampiran || '',
    diteruskan_kepada: m.diteruskan_kepada || '',
    rowBg: i % 2 ? '#f8fafc' : '#fff',
  }));
  const suratKeluar = (st.surat || []).filter(s => s.type === 'keluar').map((m, i) => ({
    id: m.id, type: m.type,
    tanggal_terima: m.tanggal_terima || '',
    tanggal_surat: m.tanggal_surat || '',
    nomor_surat: m.nomor_surat || '',
    asal_surat_dari: m.asal_surat_dari || '',
    perihal: m.perihal || '',
    lampiran: m.lampiran || '',
    diteruskan_kepada: m.diteruskan_kepada || '',
    rowBg: i % 2 ? '#f8fafc' : '#fff',
  }));

  const um = st.userModal;
  const umIsKetua = u && u.role === 'ketua';
  const umV = um ? {
    title: um.mode === 'add' ? (umIsKetua ? 'Tambah Anggota Pokja' : 'Tambah Akun Baru') : 'Edit Akun',
    saveLabel: um.mode === 'add' ? 'Buat Akun' : 'Simpan Perubahan',
    nik: um.form.nik, name: um.form.name, password: um.form.password,
    role: um.form.role, pokja: um.form.pokja, isEdit: um.mode === 'edit',
    pwdHint: um.mode === 'edit' ? '(kosongkan jika tidak diubah)' : 'Buat password',
    showRoleSelect: !!(u && u.role === 'admin' && !(um.mode === 'edit' && um.editId === st.currentUserId)),
    showPokjaSelect: !!(u && u.role === 'admin' && (um.form.role === 'ketua' || um.form.role === 'anggota') && !(um.mode === 'edit' && um.editId === st.currentUserId)),
    error: um.error || '', hasError: !!(um.error),
  } : { title: '', saveLabel: 'Simpan', nik: '', name: '', password: '', role: 'anggota', pokja: '1', isEdit: false, pwdHint: '', showRoleSelect: false, showPokjaSelect: false, error: '', hasError: false };

  let avDisplayStyle: React.CSSProperties, avDisplayInitial = '';
  if (st.avatarPreview) {
    avDisplayStyle = { width: '100px', height: '100px', borderRadius: '50%', backgroundImage: `url('${st.avatarPreview}')`, backgroundSize: 'cover', backgroundPosition: 'center' };
  } else if (u && u.avatar) {
    avDisplayStyle = { width: '100px', height: '100px', borderRadius: '50%', backgroundImage: `url('${u.avatar}')`, backgroundSize: 'cover', backgroundPosition: 'center' };
  } else {
    const avAcc = u ? raccent(u) : '#2563eb';
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
    pokjaPhotos, pokjaFiles, galFilters, galSortOptions, allPhotos, galSections, berkasFilters, allFiles, reportGroups,
    dashStats, quickActions, allUsers, pokjaMemberList, pkkMembers, inventory, suratMasuk, suratKeluar, suratView: st.suratView, blogPosts: st.blogPosts, orgPositions: st.orgPositions, pengumuman: st.pengumuman, umV, avM, cdUser, lf, demoAccounts, fileModalV, eventModal,
  };
}
