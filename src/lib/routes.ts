import type { BlogPost } from './types';
import { MONTH_ABBR } from './constants';

const ROUTE_MAP: Record<string, string> = {
  '/home': 'beranda',
  '/pkk': 'pokja',
  '/galeri': 'galeri',
  '/pengumuman': 'pengumuman',
  '/inovasi': 'inovasi',
  '/inovasi/editor': 'editor',
  '/kalender': 'kalender',
  '/laporan': 'laporan',
  '/anggota': 'anggota-pkk',
  '/inventaris': 'inventaris',
  '/surat': 'surat',
  '/arsip': 'berkas',
  '/dasbor': 'dashboard',
};

const STATE_TO_PATH: Record<string, string> = {
  beranda: '/home',
  pokja: '/pkk',
  detail: '/pkk',
  galeri: '/galeri',
  pengumuman: '/pengumuman',
  inovasi: '/inovasi',
  kalender: '/kalender',
  laporan: '/laporan',
  'anggota-pkk': '/anggota',
  inventaris: '/inventaris',
  surat: '/surat',
  berkas: '/arsip',
  dashboard: '/dasbor',
  editor: '/inovasi/editor',
  post: '/inovasi',
};

export function parsePokjaFilter(search: string): number | 'all' {
  const params = new URLSearchParams(search);
  const val = params.get('pokja');
  if (val === null || val === undefined) return 'all';
  const n = Number(val);
  if (Number.isNaN(n) || n === 0) return 'all';
  return n;
}

export function pokjaFilterToSearch(filter: number | 'all'): string {
  if (filter === 'all') return '?pokja=0';
  return `?pokja=${filter}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const MONTH_MAP: Record<string, string> = {
  januari: '01', februari: '02', maret: '03', april: '04',
  mei: '05', juni: '06', juli: '07', agustus: '08',
  september: '09', oktober: '10', november: '11', desember: '12',
  jan: '01', feb: '02', mar: '03', apr: '04',
  jun: '06', jul: '07', agu: '08', sep: '09', okt: '10', nov: '11', des: '12',
};

export function dateToYMD(dateStr: string): string {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.slice(0, 10);
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length >= 3) {
    const day = parts[0].replace(/\D/g, '').padStart(2, '0');
    const mStr = parts[1].toLowerCase();
    const month = MONTH_MAP[mStr] || '01';
    const year = parts[2].replace(/\D/g, '');
    if (year.length === 4) return `${year}-${month}-${day}`;
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  return '';
}

export function blogPostPath(post: BlogPost): string {
  const ymd = dateToYMD(post.created_at || post.date || '');
  const slug = slugify(post.title);
  if (!ymd) return `/inovasi/${slug || 'post-' + post.id}`;
  return `/inovasi/${ymd}/${slug}`;
}

export function findBlogPostBySlug(
  dateStr: string,
  slug: string,
  posts: BlogPost[]
): BlogPost | null {
  for (const post of posts) {
    const ymd = dateToYMD(post.created_at || post.date || '');
    if (ymd !== dateStr) continue;
    if (slugify(post.title) === slug) return post;
  }
  for (const post of posts) {
    if (slugify(post.title) === slug) return post;
  }
  return null;
}

export interface ParsedRoute {
  route: string;
  activePokja?: number;
  tab?: string;
  galFilter?: number | 'all';
  fileFilter?: number | 'all';
  blogDate?: string;
  blogSlug?: string;
}

export function pathToState(pathname: string, search: string): ParsedRoute {
  const path = pathname.replace(/\/+$/, '') || '/';

  if (path === '/pkk') {
    return { route: 'pokja' };
  }

  const directMatch = ROUTE_MAP[path];
  if (directMatch) {
    const result: ParsedRoute = { route: directMatch };
    if (directMatch === 'galeri') {
      result.galFilter = parsePokjaFilter(search);
    } else if (directMatch === 'berkas') {
      result.fileFilter = parsePokjaFilter(search);
    }
    return result;
  }

  if (path.startsWith('/inovasi/editor')) {
    return { route: 'editor' };
  }

  if (path.startsWith('/inovasi/')) {
    const rest = path.slice('/inovasi/'.length);
    if (!rest || rest === '') {
      return { route: 'inovasi' };
    }
    const slashIdx = rest.indexOf('/');
    if (slashIdx === -1) {
      return { route: 'inovasi' };
    }
    const datePart = rest.slice(0, slashIdx);
    const slugPart = rest.slice(slashIdx + 1);
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart) && slugPart) {
      return { route: 'post', blogDate: datePart, blogSlug: slugPart };
    }
    return { route: 'inovasi' };
  }

  if (path.startsWith('/pkk/pokja-')) {
    const n = parseInt(path.replace('/pkk/pokja-', ''), 10);
    if (n >= 1 && n <= 4) {
      return { route: 'detail', activePokja: n, tab: 'profil' };
    }
  }

  return { route: 'beranda' };
}

export function stateToPath(route: string, state: {
  activePokja?: number;
  galFilter?: number | 'all';
  fileFilter?: number | 'all';
  viewingPost?: BlogPost | null;
}): string {
  const basePath = STATE_TO_PATH[route] || '/home';

  if (route === 'detail') {
    const n = state.activePokja || 1;
    return `/pkk/pokja-${n}`;
  }

  if (route === 'post' && state.viewingPost) {
    return blogPostPath(state.viewingPost);
  }

  if (route === 'galeri' && state.galFilter !== undefined && state.galFilter !== 'all') {
    return basePath + pokjaFilterToSearch(state.galFilter);
  }

  if (route === 'berkas' && state.fileFilter !== undefined && state.fileFilter !== 'all') {
    return basePath + pokjaFilterToSearch(state.fileFilter);
  }

  return basePath;
}
