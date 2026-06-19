import { POKJA, MONTHS, STATUS_NEXT, EXT_TINT } from './constants';
import type { User, CalendarEvent, GalleryItem, FileItem, ReportItem, PokjaDef } from './types';

export const initialUsers: User[] = [
  { id: 'u1', nik: '3271010101010001', password: 'admin123', role: 'admin',   name: 'Sutrisno',       pokja: null, avatar: null },
  { id: 'u2', nik: '3271010101010002', password: 'ketua1',   role: 'ketua',   name: 'Sri Wahyuni',    pokja: 1,     avatar: null },
  { id: 'u3', nik: '3271010101010003', password: 'ketua2',   role: 'ketua',   name: 'Endang Pratiwi', pokja: 2,     avatar: null },
  { id: 'u4', nik: '3271010101010004', password: 'ketua3',   role: 'ketua',   name: 'Rohani Dewi',    pokja: 3,     avatar: null },
  { id: 'u5', nik: '3271010101010005', password: 'ketua4',   role: 'ketua',   name: 'Ratna Sari',     pokja: 4,     avatar: null },
  { id: 'u6', nik: '3271010101010006', password: 'anggota2', role: 'anggota', name: 'Rina Hayati',    pokja: 2,     avatar: null },
  { id: 'u7', nik: '3271010101010007', password: 'anggota4', role: 'anggota', name: 'Dewi Lestari',   pokja: 4,     avatar: null },
];

export const initialEvents: CalendarEvent[] = [
  { id: 1, pokja: 1, y: 2026, m: 5, d: 5,  title: 'Pengajian rutin RT 03', time: '19:30' },
  { id: 2, pokja: 1, y: 2026, m: 5, d: 17, title: 'Kerja bakti lingkungan', time: '07:00' },
  { id: 3, pokja: 2, y: 2026, m: 5, d: 8,  title: 'Pelatihan menjahit', time: '09:00' },
  { id: 4, pokja: 2, y: 2026, m: 5, d: 21, title: 'Kelas tambahan PAUD', time: '08:00' },
  { id: 5, pokja: 3, y: 2026, m: 5, d: 12, title: 'Demo masak B2SA', time: '10:00' },
  { id: 6, pokja: 3, y: 2026, m: 5, d: 24, title: 'Pasar tani desa', time: '06:30' },
  { id: 7, pokja: 4, y: 2026, m: 5, d: 3,  title: 'Posyandu balita', time: '08:00' },
  { id: 8, pokja: 4, y: 2026, m: 5, d: 18, title: 'Senam lansia', time: '06:00' },
  { id: 9, pokja: 4, y: 2026, m: 5, d: 28, title: 'Donor darah', time: '09:00' },
];

export const initialGallery: GalleryItem[] = [
  { id: 1, pokja: 1, caption: 'Gotong royong perbaikan jalan', date: '2 Jun 2026', tag: 'foto kerja bakti' },
  { id: 2, pokja: 1, caption: 'Peringatan hari kesatuan', date: '28 Mei 2026', tag: 'foto upacara' },
  { id: 3, pokja: 2, caption: 'Pelatihan menjahit ibu-ibu', date: '8 Jun 2026', tag: 'foto pelatihan' },
  { id: 4, pokja: 2, caption: 'Lomba membaca anak PAUD', date: '15 Mei 2026', tag: 'foto lomba' },
  { id: 5, pokja: 3, caption: 'Panen sayur kebun warga', date: '10 Jun 2026', tag: 'foto panen' },
  { id: 6, pokja: 3, caption: 'Demo masak menu sehat', date: '12 Jun 2026', tag: 'foto demo masak' },
  { id: 7, pokja: 4, caption: 'Posyandu balita bulanan', date: '3 Jun 2026', tag: 'foto posyandu' },
  { id: 8, pokja: 4, caption: 'Senam lansia ceria', date: '18 Jun 2026', tag: 'foto senam' },
];

export const initialFiles: FileItem[] = [
  { id: 1, pokja: 1, name: 'Notulen Rapat Pokja I.pdf',       ext: 'PDF', size: '420 KB', by: 'Sri Wahyuni',    date: '1 Jun 2026' },
  { id: 2, pokja: 2, name: 'Materi Pelatihan Menjahit.docx', ext: 'DOC', size: '1.2 MB', by: 'Endang Pratiwi', date: '6 Jun 2026' },
  { id: 3, pokja: 2, name: 'Daftar Hadir PAUD.xlsx',          ext: 'XLS', size: '88 KB',  by: 'Rina Hayati',    date: '9 Jun 2026' },
  { id: 4, pokja: 3, name: 'Resep Menu B2SA.pdf',             ext: 'PDF', size: '640 KB', by: 'Rohani Dewi',    date: '11 Jun 2026' },
  { id: 5, pokja: 4, name: 'Rekap Posyandu Juni.xlsx',        ext: 'XLS', size: '112 KB', by: 'Dewi Lestari',   date: '3 Jun 2026' },
];

export const initialReports: ReportItem[] = [
  { id: 1, date: '2 Jun 2026', name: 'Pak Joko',   contact: '0812-3300-1', pokja: 'Pokja IV',  desc: 'Mohon jadwal fogging DBD di RT 05.', status: 'Baru' },
  { id: 2, date: '4 Jun 2026', name: 'Bu Sari',    contact: '0813-7711-2', pokja: 'Pokja III', desc: 'Usul pelatihan hidroponik untuk ibu rumah tangga.', status: 'Diproses' },
  { id: 3, date: '7 Jun 2026', name: 'Pak Hendra', contact: '0857-2200-3', pokja: 'Pokja II',  desc: 'Permintaan kelas mengaji anak tambahan.', status: 'Selesai' },
  { id: 4, date: '9 Jun 2026', name: 'Bu Wati',    contact: '0856-9988-4', pokja: 'Pokja I',   desc: 'Usul kerja bakti rutin tiap akhir bulan.', status: 'Baru' },
];

export interface AppState {
  loading: boolean;
  currentUserId: string | null;
  w: number;
  menuOpen: boolean;
  users: User[];
  route: string;
  activePokja: number;
  tab: string;
  heroIdx: number;
  calY: number;
  calM: number;
  showLogin: boolean;
  loginForm: { nik: string; password: string; error: string; showDemo: boolean };
  eventModal: { day: number; title: string; time: string; id?: string | number } | null;
  galModal: { caption: string } | null;
  fileModal: { name: string; size: string } | null;
  avatarModal: boolean;
  avatarPreview: string | null;
  userModal: { mode: string; editId: string | null; form: { nik: string; name: string; password: string; role: string; pokja: string }; error: string } | null;
  confirmDelete: { userId: string } | null;
  galFilter: number | 'all';
  rf: { name: string; contact: string; category: string; desc: string };
  toast: string | null;
  nextId: number;
  events: CalendarEvent[];
  gallery: GalleryItem[];
  files: FileItem[];
  reports: ReportItem[];
}

export const initialState: AppState = {
  loading: true,
  currentUserId: null, w: 1200, menuOpen: false,
  users: [], route: 'beranda', activePokja: 1, tab: 'kalender', heroIdx: 0,
  calY: 2026, calM: 5, showLogin: false,
  loginForm: { nik: '', password: '', error: '', showDemo: false },
  eventModal: null, galModal: null, fileModal: null,
  avatarModal: false, avatarPreview: null, userModal: null, confirmDelete: null,
  galFilter: 'all',
  rf: { name: '', contact: '', category: 'Pokja IV — Kesehatan & Lingkungan', desc: '' },
  toast: null, nextId: 5000, events: [], gallery: [], files: [], reports: [],
};

export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_W'; payload: number }
  | { type: 'TOGGLE_MENU' }
  | { type: 'SET_ROUTE'; payload: string }
  | { type: 'OPEN_POKJA'; payload: number }
  | { type: 'SET_TAB'; payload: string }
  | { type: 'SET_HERO_IDX'; payload: number }
  | { type: 'SET_CAL_MONTH'; payload: { m: number; y: number } }
  | { type: 'SET_SHOW_LOGIN'; payload: boolean }
  | { type: 'SET_LOGIN_FORM'; payload: Partial<{ nik: string; password: string; error: string; showDemo: boolean }> }
  | { type: 'SET_LOGIN_ERROR'; payload: string }
  | { type: 'DO_LOGIN'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_EVENT_MODAL'; payload: AppState['eventModal'] }
  | { type: 'ADD_EVENT'; payload: CalendarEvent }
  | { type: 'UPDATE_EVENT'; payload: CalendarEvent }
  | { type: 'DELETE_EVENT'; payload: string | number }
  | { type: 'SET_GAL_MODAL'; payload: AppState['galModal'] }
  | { type: 'ADD_GALLERY'; payload: GalleryItem }
  | { type: 'DELETE_GALLERY'; payload: string | number }
  | { type: 'SET_FILE_MODAL'; payload: AppState['fileModal'] }
  | { type: 'ADD_FILE'; payload: FileItem }
  | { type: 'DELETE_FILE'; payload: string | number }
  | { type: 'SET_AVATAR_MODAL'; payload: boolean }
  | { type: 'SET_AVATAR_PREVIEW'; payload: string | null }
  | { type: 'SAVE_AVATAR'; payload: string }
  | { type: 'SET_USER_MODAL'; payload: AppState['userModal'] }
  | { type: 'SET_USER_FORM'; payload: Partial<{ nik: string; name: string; password: string; role: string; pokja: string; error: string }> }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_CONFIRM_DELETE'; payload: AppState['confirmDelete'] }
  | { type: 'SET_GAL_FILTER'; payload: number | 'all' }
  | { type: 'SET_RF'; payload: Partial<{ name: string; contact: string; category: string; desc: string }> }
  | { type: 'ADD_REPORT'; payload: ReportItem }
  | { type: 'UPDATE_REPORT_STATUS'; payload: string | number }
  | { type: 'SET_INITIAL_DATA'; payload: { users: User[]; events: CalendarEvent[]; gallery: GalleryItem[]; files: FileItem[]; reports: ReportItem[] } }
  | { type: 'SET_TOAST'; payload: string | null };

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_W': return { ...state, w: action.payload };
    case 'TOGGLE_MENU': return { ...state, menuOpen: !state.menuOpen };
    case 'SET_ROUTE': return { ...state, route: action.payload, showLogin: false, menuOpen: false };
    case 'OPEN_POKJA': return { ...state, route: 'detail', activePokja: action.payload, tab: 'kalender', menuOpen: false };
    case 'SET_TAB': return { ...state, tab: action.payload };
    case 'SET_HERO_IDX': return { ...state, heroIdx: action.payload };
    case 'SET_CAL_MONTH': return { ...state, calM: action.payload.m, calY: action.payload.y };
    case 'SET_SHOW_LOGIN': return { ...state, showLogin: action.payload };
    case 'SET_LOGIN_FORM': return { ...state, loginForm: { ...state.loginForm, error: '', ...action.payload as any } };
    case 'SET_LOGIN_ERROR': return { ...state, loginForm: { ...state.loginForm, error: action.payload } };
    case 'DO_LOGIN': return { ...state, currentUserId: action.payload, showLogin: false, route: 'dashboard', loginForm: { nik: '', password: '', error: '', showDemo: false } };
    case 'LOGOUT': return { ...state, currentUserId: null, route: 'beranda', menuOpen: false };
    case 'SET_EVENT_MODAL': return { ...state, eventModal: action.payload };
    case 'ADD_EVENT': return { ...state, events: [...state.events, action.payload], nextId: state.nextId + 1, eventModal: null };
    case 'UPDATE_EVENT': return { ...state, events: state.events.map(e => e.id === action.payload.id ? action.payload : e), eventModal: null };
    case 'DELETE_EVENT': return { ...state, events: state.events.filter(e => e.id !== action.payload) };
    case 'SET_GAL_MODAL': return { ...state, galModal: action.payload };
    case 'ADD_GALLERY': return { ...state, gallery: [action.payload, ...state.gallery], nextId: state.nextId + 1, galModal: null };
    case 'DELETE_GALLERY': return { ...state, gallery: state.gallery.filter(g => g.id !== action.payload) };
    case 'SET_FILE_MODAL': return { ...state, fileModal: action.payload };
    case 'ADD_FILE': return { ...state, files: [action.payload, ...state.files], nextId: state.nextId + 1, fileModal: null };
    case 'DELETE_FILE': return { ...state, files: state.files.filter(f => f.id !== action.payload) };
    case 'SET_AVATAR_MODAL': return { ...state, avatarModal: action.payload };
    case 'SET_AVATAR_PREVIEW': return { ...state, avatarPreview: action.payload };
    case 'SAVE_AVATAR': return { ...state, users: state.users.map(u => u.id === state.currentUserId ? { ...u, avatar: action.payload } : u), avatarModal: false, avatarPreview: null };
    case 'SET_USER_MODAL': return { ...state, userModal: action.payload };
    case 'SET_USER_FORM': return { ...state, userModal: state.userModal ? { ...state.userModal, form: { ...state.userModal.form, ...action.payload }, error: '' } : state.userModal };
    case 'ADD_USER': return { ...state, users: [...state.users, action.payload as User], nextId: state.nextId + 1, userModal: null };
    case 'UPDATE_USER': return { ...state, users: state.users.map(u => u.id === action.payload.id ? action.payload : u), userModal: null };
    case 'DELETE_USER': return { ...state, users: state.users.filter(u => u.id !== action.payload), confirmDelete: null };
    case 'SET_CONFIRM_DELETE': return { ...state, confirmDelete: action.payload };
    case 'SET_GAL_FILTER': return { ...state, galFilter: action.payload };
    case 'SET_RF': return { ...state, rf: { ...state.rf, ...action.payload } };
    case 'ADD_REPORT': return { ...state, reports: [action.payload, ...state.reports], nextId: state.nextId + 1, rf: { ...state.rf, name: '', contact: '', desc: '' } };
    case 'UPDATE_REPORT_STATUS': return { ...state, reports: state.reports.map(r => r.id === action.payload ? { ...r, status: STATUS_NEXT[r.status] || r.status } : r) };
    case 'SET_INITIAL_DATA': return { ...state, users: action.payload.users, events: action.payload.events, gallery: action.payload.gallery, files: action.payload.files, reports: action.payload.reports };
    case 'SET_TOAST': return { ...state, toast: action.payload };
    default: return state;
  }
}

// Helpers
export function rlabel(u: User | null): string {
  if (!u) return '';
  if (u.role === 'admin') return 'Admin Desa';
  const p = POKJA.find(x => x.id === u.pokja);
  return (u.role === 'ketua' ? 'Ketua ' : 'Anggota ') + (p ? p.name : '');
}

export function raccent(u: User | null): string {
  if (!u || u.role === 'admin') return '#16331f';
  const p = POKJA.find(x => x.id === u.pokja);
  return p ? p.accent : '#2c9a55';
}

export function rinit(u: User): string {
  return u.name ? u.name[0].toUpperCase() : '?';
}

export function canEditPokja(u: User | null, pokjaId: number): boolean {
  if (!u) return false;
  if (u.role === 'admin') return true;
  return u.pokja === pokjaId && (u.role === 'ketua' || u.role === 'anggota');
}

export function makeAvatarStyle(avatar: string | null, accent: string, size: string, fontSize: string, initial: string): React.CSSProperties {
  if (avatar) {
    return { width: size, height: size, borderRadius: '50%', backgroundImage: `url('${avatar}')`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 };
  }
  return { width: size, height: size, borderRadius: '50%', background: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize, fontWeight: '800', flexShrink: 0 };
}
