export interface User {
  id: string;
  nik: string;
  password: string;
  role: 'admin' | 'ketua' | 'anggota';
  name: string;
  pokja: number | null;
  avatar: string | null;
}

export interface PokjaDef {
  id: number;
  rom: string;
  name: string;
  title: string;
  sub: string;
  accent: string;
  tint: string;
}

export interface CalendarEvent {
  id: string | number;
  pokja: number;
  y: number;
  m: number;
  d: number;
  title: string;
  time: string;
}

export interface GalleryItem {
  id: string | number;
  pokja: number;
  caption: string;
  date: string;
  tag: string;
  image?: string | null;
}

export interface FileItem {
  id: string | number;
  pokja: number;
  name: string;
  ext: string;
  size: string;
  by: string;
  date: string;
}

export interface ReportItem {
  id: string | number;
  date: string;
  name: string;
  contact: string;
  pokja: string;
  desc: string;
  status: string;
}

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
  userModal: {
    mode: string; editId: string | null;
    form: { nik: string; name: string; password: string; role: string; pokja: string };
    error: string;
  } | null;
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

export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_W'; payload: number }
  | { type: 'SET_MENU'; payload: boolean }
  | { type: 'TOGGLE_MENU' }
  | { type: 'SET_ROUTE'; payload: string }
  | { type: 'OPEN_POKJA'; payload: number }
  | { type: 'SET_TAB'; payload: string }
  | { type: 'SET_HERO_IDX'; payload: number }
  | { type: 'SET_CAL_MONTH'; payload: { m: number; y: number } }
  | { type: 'SET_SHOW_LOGIN'; payload: boolean }
  | { type: 'SET_LOGIN_FORM'; payload: Partial<AppState['loginForm']> }
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
  | { type: 'SET_USER_MODAL_ERROR'; payload: string }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_CONFIRM_DELETE'; payload: AppState['confirmDelete'] }
  | { type: 'SET_GAL_FILTER'; payload: number | 'all' }
  | { type: 'SET_RF'; payload: Partial<AppState['rf']> }
  | { type: 'ADD_REPORT'; payload: ReportItem }
  | { type: 'UPDATE_REPORT_STATUS'; payload: string | number }
  | { type: 'SET_NEXT_ID'; payload: number }
  | { type: 'SET_INITIAL_DATA'; payload: { users: User[]; events: CalendarEvent[]; gallery: GalleryItem[]; files: FileItem[]; reports: ReportItem[] } }
  | { type: 'SET_TOAST'; payload: string | null };

