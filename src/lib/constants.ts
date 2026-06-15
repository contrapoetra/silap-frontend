import { PokjaDef } from './types';

export const POKJA: PokjaDef[] = [
  { id: 1, rom: 'I',   name: 'Pokja I',   title: 'Penghayatan & Pengamalan Pancasila', sub: 'Gotong Royong & ketahanan keluarga', accent: '#2c9a55', tint: '#e3f3e8' },
  { id: 2, rom: 'II',  name: 'Pokja II',  title: 'Pendidikan & Keterampilan',          sub: 'Pengembangan kehidupan berkoperasi', accent: '#3d7fd6', tint: '#e6effb' },
  { id: 3, rom: 'III', name: 'Pokja III', title: 'Pangan, Sandang & Perumahan',        sub: 'Tata laksana rumah tangga',          accent: '#d9952f', tint: '#fbf1de' },
  { id: 4, rom: 'IV',  name: 'Pokja IV',  title: 'Kesehatan & Lingkungan',             sub: 'Perencanaan sehat keluarga',         accent: '#d05c84', tint: '#fbe7ee' },
];

export const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export const STATUS: Record<string, { bg: string; color: string }> = {
  'Baru': { bg: '#fbe7ee', color: '#c0436c' },
  'Diproses': { bg: '#fbf1de', color: '#b87d1c' },
  'Selesai': { bg: '#e3f3e8', color: '#1f7e44' },
};

export const STATUS_NEXT: Record<string, string> = {
  'Baru': 'Diproses',
  'Diproses': 'Selesai',
  'Selesai': 'Baru',
};

export const EXT_TINT: Record<string, { tint: string; accent: string }> = {
  PDF: { tint: '#fbe7ee', accent: '#c0436c' },
  DOC: { tint: '#e6effb', accent: '#3d7fd6' },
  XLS: { tint: '#e3f3e8', accent: '#1f7e44' },
};
