import { PokjaDef } from './types';

export const POKJA: PokjaDef[] = [
  { id: 1, rom: 'I',   name: 'Pokja I',   title: 'Penghayatan & Pengamalan Pancasila', sub: 'Gotong Royong & ketahanan keluarga', accent: '#2563eb', tint: '#eff6ff' },
  { id: 2, rom: 'II',  name: 'Pokja II',  title: 'Pendidikan & Keterampilan',          sub: 'Pengembangan kehidupan berkoperasi', accent: '#7c3aed', tint: '#f3e8ff' },
  { id: 3, rom: 'III', name: 'Pokja III', title: 'Pangan, Sandang & Perumahan',        sub: 'Tata laksana rumah tangga',          accent: '#ea580c', tint: '#fff7ed' },
  { id: 4, rom: 'IV',  name: 'Pokja IV',  title: 'Kesehatan & Lingkungan',             sub: 'Perencanaan sehat keluarga',         accent: '#0891b2', tint: '#ecfeff' },
];

export const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export const MONTH_ABBR: Record<string, string> = {
  'Jan': 'Januari', 'Feb': 'Februari', 'Mar': 'Maret', 'Apr': 'April',
  'Mei': 'Mei', 'Jun': 'Juni', 'Jul': 'Juli', 'Agu': 'Agustus',
  'Sep': 'September', 'Okt': 'Oktober', 'Nov': 'November', 'Des': 'Desember',
};

export const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export const STATUS: Record<string, { bg: string; color: string }> = {
  'Baru': { bg: '#fef2f2', color: '#ef4444' },
  'Diproses': { bg: '#fffbeb', color: '#f59e0b' },
  'Selesai': { bg: '#f0fdf4', color: '#22c55e' },
};

export const STATUS_NEXT: Record<string, string> = {
  'Baru': 'Diproses',
  'Diproses': 'Selesai',
  'Selesai': 'Baru',
};

export const STATUS_LABEL: Record<string, string> = {
  'Baru': 'Masuk',
  'Diproses': 'Diproses',
  'Selesai': 'Selesai',
};

export const EXT_TINT: Record<string, { tint: string; accent: string }> = {
  PDF: { tint: '#fef2f2', accent: '#ef4444' },
  DOC: { tint: '#eff6ff', accent: '#3b82f6' },
  XLS: { tint: '#f0fdf4', accent: '#22c55e' },
};
