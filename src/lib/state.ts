import { POKJA, MONTHS, STATUS_NEXT, EXT_TINT } from "./constants";
import type {
  User,
  CalendarEvent,
  GalleryItem,
  FileItem,
  ReportItem,
  PKKMember,
  InventoryItem,
  SuratItem,
  PokjaDef,
  BlogPost,
  OrgPosition,
  PengumumanItem,
} from "./types";

export const initialUsers: User[] = [
  {
    id: "u1",
    nik: "3271010101010001",
    password: "admin123",
    role: "admin",
    name: "Sutrisno",
    pokja: null,
    avatar: null,
  },
  {
    id: "u2",
    nik: "3271010101010002",
    password: "ketua1",
    role: "ketua",
    name: "Sri Wahyuni",
    pokja: 1,
    avatar: null,
  },
  {
    id: "u3",
    nik: "3271010101010003",
    password: "ketua2",
    role: "ketua",
    name: "Endang Pratiwi",
    pokja: 2,
    avatar: null,
  },
  {
    id: "u4",
    nik: "3271010101010004",
    password: "ketua3",
    role: "ketua",
    name: "Rohani Dewi",
    pokja: 3,
    avatar: null,
  },
  {
    id: "u5",
    nik: "3271010101010005",
    password: "ketua4",
    role: "ketua",
    name: "Ratna Sari",
    pokja: 4,
    avatar: null,
  },
  {
    id: "u6",
    nik: "3271010101010006",
    password: "anggota2",
    role: "anggota",
    name: "Rina Hayati",
    pokja: 2,
    avatar: null,
  },
  {
    id: "u7",
    nik: "3271010101010007",
    password: "anggota4",
    role: "anggota",
    name: "Dewi Lestari",
    pokja: 4,
    avatar: null,
  },
];

export const initialEvents: CalendarEvent[] = [
  {
    id: 1,
    pokja: 1,
    y: 2026,
    m: 5,
    d: 5,
    title: "Pengajian rutin RT 03",
    time: "19:30",
  },
  {
    id: 2,
    pokja: 1,
    y: 2026,
    m: 5,
    d: 17,
    title: "Kerja bakti lingkungan",
    time: "07:00",
  },
  {
    id: 3,
    pokja: 2,
    y: 2026,
    m: 5,
    d: 8,
    title: "Pelatihan menjahit",
    time: "09:00",
  },
  {
    id: 4,
    pokja: 2,
    y: 2026,
    m: 5,
    d: 21,
    title: "Kelas tambahan PAUD",
    time: "08:00",
  },
  {
    id: 5,
    pokja: 3,
    y: 2026,
    m: 5,
    d: 12,
    title: "Demo masak B2SA",
    time: "10:00",
  },
  {
    id: 6,
    pokja: 3,
    y: 2026,
    m: 5,
    d: 24,
    title: "Pasar tani desa",
    time: "06:30",
  },
  {
    id: 7,
    pokja: 4,
    y: 2026,
    m: 5,
    d: 3,
    title: "Posyandu balita",
    time: "08:00",
  },
  {
    id: 8,
    pokja: 4,
    y: 2026,
    m: 5,
    d: 18,
    title: "Senam lansia",
    time: "06:00",
  },
  {
    id: 9,
    pokja: 4,
    y: 2026,
    m: 5,
    d: 28,
    title: "Donor darah",
    time: "09:00",
  },
];

export const initialGallery: GalleryItem[] = [];

export const initialFiles: FileItem[] = [
  {
    id: 1,
    pokja: 1,
    name: "Notulen Rapat Pokja I.pdf",
    ext: "PDF",
    size: "420 KB",
    by: "Sri Wahyuni",
    date: "1 Jun 2026",
  },
  {
    id: 2,
    pokja: 2,
    name: "Materi Pelatihan Menjahit.docx",
    ext: "DOC",
    size: "1.2 MB",
    by: "Endang Pratiwi",
    date: "6 Jun 2026",
  },
  {
    id: 3,
    pokja: 2,
    name: "Daftar Hadir PAUD.xlsx",
    ext: "XLS",
    size: "88 KB",
    by: "Rina Hayati",
    date: "9 Jun 2026",
  },
  {
    id: 4,
    pokja: 3,
    name: "Resep Menu B2SA.pdf",
    ext: "PDF",
    size: "640 KB",
    by: "Rohani Dewi",
    date: "11 Jun 2026",
  },
  {
    id: 5,
    pokja: 4,
    name: "Rekap Posyandu Juni.xlsx",
    ext: "XLS",
    size: "112 KB",
    by: "Dewi Lestari",
    date: "3 Jun 2026",
  },
];

export const initialBlogPosts: BlogPost[] = [
  { id: 1, title: 'Inovasi Digitalisasi Administrasi Pokja', excerpt: 'Pembuatan sistem informasi terpadu untuk menunjang administrasi dan pelaporan setiap pokja di Desa Bunutwetan.', content: '', author: 'Admin Desa', date: '15 Jun 2026', category: 'Teknologi' },
  { id: 2, title: 'Program Bank Sampah Berbasis Komunitas', excerpt: 'Pokja III meluncurkan program bank sampah yang dikelola oleh ibu-ibu PKK sebagai upaya pengelolaan limbah rumah tangga.', content: '', author: 'Ketua Pokja III', date: '10 Jun 2026', category: 'Lingkungan' },
  { id: 3, title: 'Pelatihan Hidroponik untuk Ketahanan Pangan', excerpt: 'Inovasi pertanian hidroponik diperkenalkan kepada warga sebagai solusi bercocok tanam di lahan terbatas.', content: '', author: 'Pokja III', date: '2 Jun 2026', category: 'Pangan' },
  { id: 4, title: 'Posyandu Digital: Aplikasi Pemantauan Balita', excerpt: 'Digitalisasi data posyandu memudahkan pemantauan tumbuh kembang balita dan ibu hamil di desa.', content: '', author: 'Ketua Pokja IV', date: '28 Mei 2026', category: 'Kesehatan' },
  { id: 5, title: 'Gerakan 1000 Taman Baca Keluarga', excerpt: 'Inisiatif Pokja II mendirikan taman baca di setiap RT untuk meningkatkan literasi sejak usia dini.', content: '', author: 'Pokja II', date: '20 Mei 2026', category: 'Pendidikan' },
];

export const initialReports: ReportItem[] = [
  {
    id: 1,
    date: "2 Jun 2026",
    name: "Pak Joko",
    contact: "0812-3300-1",
    pokja: "Pokja IV",
    desc: "Mohon jadwal fogging DBD di RT 05.",
    status: "Baru",
  },
  {
    id: 2,
    date: "4 Jun 2026",
    name: "Bu Sari",
    contact: "0813-7711-2",
    pokja: "Pokja III",
    desc: "Usul pelatihan hidroponik untuk ibu rumah tangga.",
    status: "Diproses",
  },
  {
    id: 3,
    date: "7 Jun 2026",
    name: "Pak Hendra",
    contact: "0857-2200-3",
    pokja: "Pokja II",
    desc: "Permintaan kelas mengaji anak tambahan.",
    status: "Selesai",
  },
  {
    id: 4,
    date: "9 Jun 2026",
    name: "Bu Wati",
    contact: "0856-9988-4",
    pokja: "Pokja I",
    desc: "Usul kerja bakti rutin tiap akhir bulan.",
    status: "Baru",
  },
  {
    id: 5,
    date: "15 Mei 2026",
    name: "Pak Agus",
    contact: "0812-4400-5",
    pokja: "Pokja IV",
    desc: "Laporan genangan air di RT 02.",
    status: "Selesai",
  },
  {
    id: 6,
    date: "22 Mei 2026",
    name: "Bu Dewi",
    contact: "0813-5511-6",
    pokja: "Pokja III",
    desc: "Usul bantuan sembako untuk lansia.",
    status: "Diproses",
  },
  {
    id: 7,
    date: "10 Apr 2026",
    name: "Pak Slamet",
    contact: "0857-6600-7",
    pokja: "Pokja I",
    desc: "Kegiatan gotong royong perlu koordinasi ulang.",
    status: "Selesai",
  },
];

export const initialPKKMembers: PKKMember[] = [
  { id: 1, name: 'Drs. H. Supriono', position: 'Pembina', gender: 'L', birth_place: 'Mojokerto', birth_date: '15 Agustus 1970', marital_status: 'Kawin', address: 'Dsn. Bunutwetan RT 01 RW 01', education: 'S1', occupation: 'Kepala Desa', membership_status: 'Aktif', nik: '3512345678900001' },
  { id: 2, name: 'Hj. Siti Rokhmah', position: 'Ketua TP. PKK', gender: 'P', birth_place: 'Mojokerto', birth_date: '22 Januari 1975', marital_status: 'Kawin', address: 'Dsn. Bunutwetan RT 01 RW 01', education: 'S1', occupation: 'Ketua TP PKK', membership_status: 'Aktif', nik: '3512345678900002' },
  { id: 3, name: 'Nurul Hidayah', position: 'Ketua Pokja I', gender: 'P', birth_place: 'Mojokerto', birth_date: '10 Maret 1988', marital_status: 'Kawin', address: 'Dsn. Bunutwetan RT 02 RW 01', education: 'SMA', occupation: 'Ibu Rumah Tangga', membership_status: 'Aktif', pokja: 1 },
  { id: 4, name: 'Fitriani', position: 'Ketua Pokja II', gender: 'P', birth_place: 'Mojokerto', birth_date: '5 Juli 1990', marital_status: 'Kawin', address: 'Dsn. Bunutwetan RT 03 RW 01', education: 'D3', occupation: 'Guru', membership_status: 'Aktif', pokja: 2 },
  { id: 5, name: 'Sari Dewi', position: 'Ketua Pokja III', gender: 'P', birth_place: 'Mojokerto', birth_date: '12 November 1985', marital_status: 'Kawin', address: 'Dsn. Bunutwetan RT 01 RW 02', education: 'S1', occupation: 'PNS', membership_status: 'Aktif', pokja: 3 },
  { id: 6, name: 'Rina Wati', position: 'Ketua Pokja IV', gender: 'P', birth_place: 'Mojokerto', birth_date: '20 September 1992', marital_status: 'Kawin', address: 'Dsn. Bunutwetan RT 04 RW 02', education: 'SMA', occupation: 'Wiraswasta', membership_status: 'Aktif', pokja: 4 },
];
export const initialInventory: InventoryItem[] = [
  // Standalone items
  { id: 1, nama_barang: 'Papan Data PKK', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Kantor Desa', kondisi_barang: 'Bagus', children: [] },
  { id: 2, nama_barang: 'Papan 10 Program Pokok', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus', children: [] },
  { id: 3, nama_barang: 'Piring', asal_barang: '', jumlah: 25, tempat_penyimpanan: 'Sda', kondisi_barang: 'Berkurang', children: [] },
  { id: 4, nama_barang: 'Sendok', asal_barang: '', jumlah: 24, tempat_penyimpanan: 'Sda', kondisi_barang: 'Berkurang', children: [] },
  { id: 5, nama_barang: 'Piring Kue', asal_barang: '', jumlah: 6, tempat_penyimpanan: 'Sda', kondisi_barang: 'Berkurang', children: [] },
  { id: 6, nama_barang: 'Gelas', asal_barang: '', jumlah: 24, tempat_penyimpanan: 'Sda', kondisi_barang: 'Berkurang', children: [] },
  { id: 7, nama_barang: 'Cangkir', asal_barang: '', jumlah: 12, tempat_penyimpanan: 'Sda', kondisi_barang: 'Berkurang', children: [] },
  { id: 8, nama_barang: 'Mangkok', asal_barang: '', jumlah: 12, tempat_penyimpanan: 'Sda', kondisi_barang: 'Berkurang', children: [] },
  { id: 9, nama_barang: 'Piala', asal_barang: '', jumlah: 9, tempat_penyimpanan: 'Kantor PKK', kondisi_barang: 'Bagus', children: [] },
  { id: 10, nama_barang: 'Blender', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus', children: [] },

  // Buku Sekretariat (+ 13 sub-buku di bawahnya)
  { id: 11, nama_barang: 'Buku Sekretariat', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus', children: [
    { id: 12, nama_barang: '1. Bk Kader & TP PKK', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 13, nama_barang: '2. Bk. Agenda Surat', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 14, nama_barang: '3. Bk. Kas Umum', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 15, nama_barang: '4. Bk. Kas harian', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 16, nama_barang: '5. Bk. Kas Notulen', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 17, nama_barang: '6. Bk. Inventaris', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 18, nama_barang: '7. Bk Kegiatan', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 19, nama_barang: '8. Bk. Ekspedisi', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 20, nama_barang: '9. Bk. Daftar Hadir', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 21, nama_barang: '10. Bk. Harian Piket', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 22, nama_barang: '11. Bk. Tamu', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 23, nama_barang: '12. Bk. Program Kerja jangka 5 tahun', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 25, nama_barang: '13. Bk. Kegiatan Tahunan', asal_barang: '', jumlah: 0, tempat_penyimpanan: 'Sda', kondisi_barang: '' },
  ] },

  // Buku Pokja I (+ 9 sub-buku)
  { id: 26, nama_barang: 'Buku Pokja I', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus', children: [
    { id: 27, nama_barang: '1. Bk. Program Kerja jangka 5 tahun', asal_barang: '', jumlah: 0, tempat_penyimpanan: 'Sda', kondisi_barang: '' },
    { id: 29, nama_barang: '2. Bk. kegiatan Tahunan', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 30, nama_barang: '3. Bk. Kegiatan', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 31, nama_barang: '4. Bk.Data kegiatan', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 32, nama_barang: '5. Bk. Data Anak Asuh', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 33, nama_barang: '6. Bk. Data Anak Yatim Piatu', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 34, nama_barang: '7. Bk. Kegiatan Sosial', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 35, nama_barang: '8. Bk. Data tempat Ibadah', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 36, nama_barang: '9. Bk. Susunan pengurus', asal_barang: '', jumlah: 0, tempat_penyimpanan: 'Sda', kondisi_barang: '' },
  ] },

  // Buku Pokja II (+ 14 sub-buku)
  { id: 37, nama_barang: 'Buku Pokja II', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus', children: [
    { id: 38, nama_barang: '1. Bk. Prog Kerja 5 Tahun', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 39, nama_barang: '2. Bk. Kegiatan Tahunan', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 40, nama_barang: '3. Bk. Kegiatan', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 41, nama_barang: '4. Bk. Data Keg PKK', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 42, nama_barang: '5. Bk. Pelaks Prog Kerja', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 43, nama_barang: '6. Buku Notulen', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 44, nama_barang: '7. Buku Data TK PKK', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 45, nama_barang: '8. Bk. Data Guru TK PKK', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 46, nama_barang: '9. Bk. Data BKB', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 47, nama_barang: '10. Bk. Pengemb. GerBKB', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 48, nama_barang: '11. Bk. Kader TP PKK Ds', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 49, nama_barang: '12. Bk. Koperasi', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 50, nama_barang: '13. Bk. Susunan pengurus', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 51, nama_barang: '14. Bk. Daftar Hadir Keg.', asal_barang: '', jumlah: 0, tempat_penyimpanan: 'Sda', kondisi_barang: '' },
  ] },

  // Buku Pokja III (+ 15 sub-buku)
  { id: 52, nama_barang: 'Buku Pokja III', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus', children: [
    { id: 53, nama_barang: '1. Bk. Prog Kerja 5 Tahun', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 54, nama_barang: '2. Bk. Kegiatan Tahunan', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 55, nama_barang: '3. Bk. Kegiatan', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 56, nama_barang: '4. Bk. Data kegiatan', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 57, nama_barang: '5. Bk. Susunan pengurus', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 58, nama_barang: '6. Bk Data Kader', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 59, nama_barang: '7. Bk Penyuluhan lingk. Hdp', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 60, nama_barang: '8. Bk Industri Rmh. tangga', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 61, nama_barang: '9. Bk. Data Lomba', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 62, nama_barang: '10. Bk. Bantuan', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 63, nama_barang: '11. Bk. Inventaris Toga', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 64, nama_barang: '12. Bk Penanaman', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 65, nama_barang: '13. Bk. Pemanfaatan', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 66, nama_barang: '14. Bk. Jadwal Piket', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 67, nama_barang: '15. Bk. Tamu', asal_barang: '', jumlah: 0, tempat_penyimpanan: 'Sda', kondisi_barang: '' },
  ] },

  // Buku Pokja IV (+ 17 sub-buku)
  { id: 68, nama_barang: 'Buku Pokja IV', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus', children: [
    { id: 69, nama_barang: '1. Bk. Prog Kerja 5 Thn', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 70, nama_barang: '2. Bk. Kegiatan Tahunan', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 71, nama_barang: '3. Bk. Kegiatan', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 72, nama_barang: '4. Bk. Data Kegiatan', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 73, nama_barang: '5. Bk. Data PIN', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 74, nama_barang: '6. Bk. Data GSI', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 75, nama_barang: '7. Bk. Program PSN', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 76, nama_barang: '8. Bk. Kegiatan Posyandu', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 77, nama_barang: '9. Bk. Jml Pengunjung', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 78, nama_barang: 'petugas posyandu / jml.', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 79, nama_barang: 'bayi lahir & meninggal', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 80, nama_barang: '10. Bk. Dana sehat', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 81, nama_barang: 'a. Buku pengurus', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 82, nama_barang: 'b. Buku penyumbang', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 83, nama_barang: 'c. Bk Penerima sumbangan', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 84, nama_barang: '11. Bk.Daftar Hadir Keg.', asal_barang: '', jumlah: 1, tempat_penyimpanan: 'Sda', kondisi_barang: 'Bagus' },
    { id: 85, nama_barang: '12. Bk.Susunan pengurus', asal_barang: '', jumlah: 0, tempat_penyimpanan: 'Sda', kondisi_barang: '' },
  ] },
];
export const initialSurat: SuratItem[] = [
  { id: 1, type: 'masuk', tanggal_terima: '10 Januari 2025', tanggal_surat: '10 Januari 2025', nomor_surat: '02/SKR/PKK KEC/I/2025', asal_surat_dari: 'TP PKK KEC PAKIS', perihal: 'Undangan Sosialisasi Program Kerja Bidang Umum Dan Bimtek E-PKK', lampiran: '', diteruskan_kepada: 'TP PKK DESA' },
  { id: 2, type: 'masuk', tanggal_terima: '21-Apr-25', tanggal_surat: '21-Apr-25', nomor_surat: '15/SKR/PKK KEC/IV/2025', asal_surat_dari: 'TP PKK KEC PAKIS', perihal: 'Undangan Silaturahmi Halal Bi Halal Majelis Taklim Khoirunnisa Al Wardah', lampiran: '', diteruskan_kepada: 'TP PKK DESA' },
  { id: 3, type: 'masuk', tanggal_terima: '16 Mei 2025', tanggal_surat: '16 Mei 2025', nomor_surat: '23/SKR/PKK KEC/V/2025', asal_surat_dari: 'TP PKK KEC PAKIS', perihal: 'Undangan Sosialisasi Bahaya Narkoba', lampiran: '', diteruskan_kepada: 'TP PKK DESA' },
  { id: 4, type: 'masuk', tanggal_terima: '13 Juni 2025', tanggal_surat: '13 Juni 2025', nomor_surat: '25/SKR/PKK KEC/VI/2025', asal_surat_dari: 'TP PKK KEC PAKIS', perihal: 'Undangan Sosialisasi Gerakan Penanaman Pohon Dilingkungan Sekitar', lampiran: '', diteruskan_kepada: 'TP PKK DESA' },
  { id: 5, type: 'masuk', tanggal_terima: '30 Juni 2025', tanggal_surat: '30 Juni 2025', nomor_surat: '28/SKR/PKK KEC/ VI/2025', asal_surat_dari: 'TP PKK KEC PAKIS', perihal: 'Pemberitahuan Kegiatan Peningkatan Kapasitas Kader Pkk Ke Desa Madiredo Kecamatan Pujon', lampiran: '', diteruskan_kepada: 'TP PKK DESA' },
  { id: 6, type: 'masuk', tanggal_terima: '21 Juli  2025', tanggal_surat: '21 Juli  2025', nomor_surat: '31/SKR/PKK KEC/VII/2025', asal_surat_dari: 'TP PKK KEC PAKIS', perihal: 'Undangan Sosialisasi Pengelolaan Usaha Mikro (Up2k) Dan Pembinaan Tk Pkk', lampiran: '', diteruskan_kepada: 'TP PKK DESA' },
  { id: 7, type: 'masuk', tanggal_terima: '18 Agustus  2025', tanggal_surat: '18 Agustus  2025', nomor_surat: '34/SKR/PKK KEC/VIII/2025', asal_surat_dari: 'TP PKK KEC PAKIS', perihal: 'Undangan Majelis Taklim Khoirunnisa Al Wardah', lampiran: '', diteruskan_kepada: 'TP PKK DESA' },
  { id: 8, type: 'masuk', tanggal_terima: '11-Sept-25', tanggal_surat: '11-Sept-25', nomor_surat: '36/SKR/PKK KEC/IX/2025', asal_surat_dari: 'TP PKK KEC PAKIS', perihal: 'Pemberitahuan Pelaksanaan Kegiatan Lomba Kelompok ASMANTOGA tingkat Kecamatan Pakis Tahun 2025', lampiran: '', diteruskan_kepada: 'TP PKK DESA' },
  { id: 9, type: 'masuk', tanggal_terima: '18-Sept-25', tanggal_surat: '18-Sept-25', nomor_surat: '37/SKR/PKK KEC/IX/2025', asal_surat_dari: 'TP PKK KEC PAKIS', perihal: 'Undangan Pelatihan Pembuatan Keset Untuk Lansia', lampiran: '', diteruskan_kepada: 'TP PKK DESA' },
  { id: 10, type: 'masuk', tanggal_terima: '25-Sept-25', tanggal_surat: '25-Sept-25', nomor_surat: '38/SKR/PKK KEC/IX/2025', asal_surat_dari: 'TP PKK KEC PAKIS', perihal: 'Undangan Sosialisasi Program Prioritas Gerakan PKK Kabupaten Malang', lampiran: '', diteruskan_kepada: 'TP PKK DESA' },
  { id: 11, type: 'masuk', tanggal_terima: '11-Nov-25', tanggal_surat: '11-Nov-25', nomor_surat: '40/SKR/PKK KEC/XI/2025', asal_surat_dari: 'TP PKK KEC PAKIS', perihal: 'Undangan Workshop Bisnis dengan tema "Transformasi Bisnis dengan Artifisial Intelegen/AI (kecerdasan Buatan, Inovasi untuk ekonomi Keluarga" di Pendopo Kabupaten malang', lampiran: '', diteruskan_kepada: 'TP PKK DESA' },
  { id: 12, type: 'masuk', tanggal_terima: '20-Nov-25', tanggal_surat: '20-Nov-25', nomor_surat: '41/SKR/PKK KEC/XI/2025', asal_surat_dari: 'TP PKK KEC PAKIS', perihal: 'Undangan Sosialisasi desa Iklim dari UPT puskesmas Pakis, Sosialisasi Pengolahan sampah organik dan An organik melalui bank sampah, Sosialisasi Gerakan selamatkan Pangan dan penanganan Food loss dan Food Waste (susut pangan dan sisa pangan)', lampiran: '', diteruskan_kepada: 'TP PKK DESA' },
];

export interface AppState {

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
  loginForm: {
    nik: string;
    password: string;
    error: string;
    showDemo: boolean;
  };
  eventModal: {
    day: number;
    title: string;
    time: string;
    id?: string | number;
    pokja: number;
  } | null;
  galModal: { caption: string } | null;
  fileModal: { name: string; size: string } | null;
  avatarModal: boolean;
  avatarPreview: string | null;
  userModal: {
    mode: string;
    editId: string | null;
    form: {
      nik: string;
      name: string;
      password: string;
      role: string;
      pokja: string;
    };
    error: string;
  } | null;
  confirmDelete: { userId: string } | null;
  postModal: {
    mode: "add" | "edit";
    editId: string | number | null;
    form: { title: string; excerpt: string; content: string; category: string };
  } | null;
  galFilter: number | "all";
  galSort: "date" | "name" | "pokja";
  fileFilter: number | "all";
  rf: { name: string; contact: string; category: string; desc: string };
  toast: string | null;
  nextId: number;
  events: CalendarEvent[];
  gallery: GalleryItem[];
  files: FileItem[];
  reports: ReportItem[];
  pkkMembers: PKKMember[];
  inventory: InventoryItem[];
  surat: SuratItem[];
  suratView: 'masuk' | 'keluar';
  blogPosts: BlogPost[];
  orgPositions: OrgPosition[];
  pengumuman: PengumumanItem[];
  viewingPost: BlogPost | null;
}

export const initialState: AppState = {

  currentUserId: null,
  w: 1200,
  menuOpen: false,
  users: [],
  route: "beranda",
  activePokja: 1,
  tab: "kalender",
  heroIdx: 0,
  calY: 2026,
  calM: 5,
  showLogin: false,
  loginForm: { nik: "", password: "", error: "", showDemo: false },
  eventModal: null,
  galModal: null,
  fileModal: null,
  avatarModal: false,
  avatarPreview: null,
  userModal: null,
  confirmDelete: null,
  postModal: null,
  galFilter: "all",
  galSort: "date",
  fileFilter: "all",
  rf: {
    name: "",
    contact: "",
    category: "Pokja IV — Kesehatan & Lingkungan",
    desc: "",
  },
  toast: null,
  nextId: 5000,
  events: [],
  gallery: [],
  files: [],
  reports: [],
  pkkMembers: initialPKKMembers,
  inventory: initialInventory,
  surat: initialSurat,
  suratView: 'masuk',
  blogPosts: [],
  orgPositions: [],
  pengumuman: [],
  viewingPost: null,
};

export type AppAction =
  | { type: "SET_W"; payload: number }
  | { type: "TOGGLE_MENU" }
  | { type: "SET_ROUTE"; payload: string }
  | { type: "OPEN_POKJA"; payload: { pokja: number; tab?: string } }
  | { type: "SET_TAB"; payload: string }
  | { type: "SET_HERO_IDX"; payload: number }
  | { type: "SET_CAL_MONTH"; payload: { m: number; y: number } }
  | { type: "SET_SHOW_LOGIN"; payload: boolean }
  | {
      type: "SET_LOGIN_FORM";
      payload: Partial<{
        nik: string;
        password: string;
        error: string;
        showDemo: boolean;
      }>;
    }
  | { type: "SET_LOGIN_ERROR"; payload: string }
  | { type: "DO_LOGIN"; payload: string }
  | { type: "LOGOUT" }
  | { type: "SET_EVENT_MODAL"; payload: AppState["eventModal"] }
  | { type: "ADD_EVENT"; payload: CalendarEvent }
  | { type: "UPDATE_EVENT"; payload: CalendarEvent }
  | { type: "DELETE_EVENT"; payload: string | number }
  | { type: "SET_GAL_MODAL"; payload: AppState["galModal"] }
  | { type: "ADD_GALLERY"; payload: GalleryItem }
  | { type: "DELETE_GALLERY"; payload: string | number }
  | { type: "UPDATE_GALLERY_ID"; payload: { oldId: string | number; newId: string | number } }
  | { type: "SET_FILE_MODAL"; payload: AppState["fileModal"] }
  | { type: "ADD_FILE"; payload: FileItem }
  | { type: "DELETE_FILE"; payload: string | number }
  | { type: "SET_AVATAR_MODAL"; payload: boolean }
  | { type: "SET_AVATAR_PREVIEW"; payload: string | null }
  | { type: "SAVE_AVATAR"; payload: string }
  | { type: "SET_USER_MODAL"; payload: AppState["userModal"] }
  | {
      type: "SET_USER_FORM";
      payload: Partial<{
        nik: string;
        name: string;
        password: string;
        role: string;
        pokja: string;
        error: string;
      }>;
    }
  | { type: "ADD_USER"; payload: User }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "DELETE_USER"; payload: string }
  | { type: "SET_CONFIRM_DELETE"; payload: AppState["confirmDelete"] }
  | { type: "SET_GAL_FILTER"; payload: number | "all" }
  | { type: "SET_GAL_SORT"; payload: "date" | "name" | "pokja" }
  | { type: "SET_FILE_FILTER"; payload: number | "all" }
  | {
      type: "SET_RF";
      payload: Partial<{
        name: string;
        contact: string;
        category: string;
        desc: string;
      }>;
    }
  | { type: "ADD_REPORT"; payload: ReportItem }
  | { type: "UPDATE_REPORT_STATUS"; payload: string | number }
  | {
      type: "SET_INITIAL_DATA";
      payload: {
        users: User[];
        events: CalendarEvent[];
        gallery: GalleryItem[];
        files: FileItem[];
        reports: ReportItem[];
        pkkMembers: PKKMember[];
        inventory: InventoryItem[];
        surat: SuratItem[];
        blogPosts: BlogPost[];
        orgPositions: OrgPosition[];
        pengumuman: PengumumanItem[];
      };
    }
  | { type: "SET_ORG_POSITIONS"; payload: OrgPosition[] }
  | { type: "SET_POST_MODAL"; payload: AppState["postModal"] }
  | { type: "SET_POST_FORM"; payload: Partial<{ title: string; excerpt: string; content: string; category: string }> }
  | { type: "SET_BLOG_POSTS"; payload: BlogPost[] }
  | { type: "ADD_BLOG_POST"; payload: BlogPost }
  | { type: "UPDATE_BLOG_POST"; payload: BlogPost }
  | { type: "DELETE_BLOG_POST"; payload: string | number }
  | { type: "SET_VIEWING_POST"; payload: BlogPost | null }
  | { type: "ADD_PKK_MEMBER"; payload: PKKMember }
  | { type: "UPDATE_PKK_MEMBER"; payload: PKKMember }
  | { type: "DELETE_PKK_MEMBER"; payload: string | number }
  | { type: "SET_INVENTORY"; payload: InventoryItem[] }
  | { type: "ADD_INVENTORY"; payload: InventoryItem }
  | { type: "UPDATE_INVENTORY"; payload: InventoryItem }
  | { type: "DELETE_INVENTORY"; payload: string | number }
  | { type: "ADD_INVENTORY_CHILD"; payload: { parentId: string | number; item: InventoryItem } }
  | { type: "SET_SURAT"; payload: SuratItem[] }
  | { type: "ADD_SURAT"; payload: SuratItem }
  | { type: "UPDATE_SURAT"; payload: SuratItem }
  | { type: "DELETE_SURAT"; payload: string | number }
  | { type: "SET_SURAT_VIEW"; payload: 'masuk' | 'keluar' }
  | { type: "SET_PENGUMUMAN"; payload: PengumumanItem[] }
  | { type: "ADD_PENGUMUMAN"; payload: PengumumanItem }
  | { type: "UPDATE_PENGUMUMAN"; payload: PengumumanItem }
  | { type: "DELETE_PENGUMUMAN"; payload: string | number }
  | { type: "SET_TOAST"; payload: string | null };

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_W":
      return { ...state, w: action.payload };
    case "TOGGLE_MENU":
      return { ...state, menuOpen: !state.menuOpen };
    case "SET_ROUTE":
      return {
        ...state,
        route: action.payload,
        showLogin: false,
        menuOpen: false,
      };
    case "OPEN_POKJA":
      return {
        ...state,
        route: "detail",
        activePokja: action.payload.pokja,
        tab: action.payload.tab ?? "profil",
        menuOpen: false,
      };
    case "SET_TAB":
      return { ...state, tab: action.payload };
    case "SET_HERO_IDX":
      return { ...state, heroIdx: action.payload };
    case "SET_CAL_MONTH":
      return { ...state, calM: action.payload.m, calY: action.payload.y };
    case "SET_SHOW_LOGIN":
      return { ...state, showLogin: action.payload };
    case "SET_LOGIN_FORM":
      return {
        ...state,
        loginForm: {
          ...state.loginForm,
          error: "",
          ...(action.payload as any),
        },
      };
    case "SET_LOGIN_ERROR":
      return {
        ...state,
        loginForm: { ...state.loginForm, error: action.payload },
      };
    case "DO_LOGIN":
      return {
        ...state,
        currentUserId: action.payload,
        showLogin: false,
        route: "dashboard",
        loginForm: { nik: "", password: "", error: "", showDemo: false },
      };
    case "LOGOUT":
      return {
        ...state,
        currentUserId: null,
        route: "beranda",
        menuOpen: false,
      };
    case "SET_EVENT_MODAL":
      return { ...state, eventModal: action.payload };
    case "ADD_EVENT":
      return {
        ...state,
        events: [...state.events, action.payload],
        nextId: state.nextId + 1,
        eventModal: null,
      };
    case "UPDATE_EVENT":
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.payload.id ? action.payload : e,
        ),
        eventModal: null,
      };
    case "DELETE_EVENT":
      return {
        ...state,
        events: state.events.filter((e) => e.id !== action.payload),
      };
    case "SET_GAL_MODAL":
      return { ...state, galModal: action.payload };
    case "ADD_GALLERY":
      return {
        ...state,
        gallery: [action.payload, ...state.gallery],
        nextId: state.nextId + 1,
        galModal: null,
      };
    case "DELETE_GALLERY":
      return {
        ...state,
        gallery: state.gallery.filter((g) => g.id !== action.payload),
      };
    case "UPDATE_GALLERY_ID":
      return {
        ...state,
        gallery: state.gallery.map((g) =>
          g.id === action.payload.oldId ? { ...g, id: action.payload.newId } : g
        ),
      };
    case "SET_FILE_MODAL":
      return { ...state, fileModal: action.payload };
    case "ADD_FILE":
      return {
        ...state,
        files: [action.payload, ...state.files],
        nextId: state.nextId + 1,
        fileModal: null,
      };
    case "DELETE_FILE":
      return {
        ...state,
        files: state.files.filter((f) => f.id !== action.payload),
      };
    case "SET_AVATAR_MODAL":
      return { ...state, avatarModal: action.payload };
    case "SET_AVATAR_PREVIEW":
      return { ...state, avatarPreview: action.payload };
    case "SAVE_AVATAR":
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === state.currentUserId ? { ...u, avatar: action.payload } : u,
        ),
        avatarModal: false,
        avatarPreview: null,
      };
    case "SET_USER_MODAL":
      return { ...state, userModal: action.payload };
    case "SET_USER_FORM":
      return {
        ...state,
        userModal: state.userModal
          ? {
              ...state.userModal,
              form: { ...state.userModal.form, ...action.payload },
              error: "",
            }
          : state.userModal,
      };
    case "ADD_USER":
      return {
        ...state,
        users: [...state.users, action.payload as User],
        nextId: state.nextId + 1,
        userModal: null,
      };
    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.payload.id ? action.payload : u,
        ),
        userModal: null,
      };
    case "DELETE_USER":
      return {
        ...state,
        users: state.users.filter((u) => u.id !== action.payload),
        confirmDelete: null,
      };
    case "SET_CONFIRM_DELETE":
      return { ...state, confirmDelete: action.payload };
    case "SET_GAL_FILTER":
      return { ...state, galFilter: action.payload };
    case "SET_GAL_SORT":
      return { ...state, galSort: action.payload };
    case "SET_FILE_FILTER":
      return { ...state, fileFilter: action.payload };
    case "SET_RF":
      return { ...state, rf: { ...state.rf, ...action.payload } };
    case "ADD_REPORT":
      return {
        ...state,
        reports: [action.payload, ...state.reports],
        nextId: state.nextId + 1,
        rf: { ...state.rf, name: "", contact: "", desc: "" },
      };
    case "UPDATE_REPORT_STATUS":
      return {
        ...state,
        reports: state.reports.map((r) =>
          r.id === action.payload
            ? { ...r, status: STATUS_NEXT[r.status] || r.status }
            : r,
        ),
      };
    case "SET_INITIAL_DATA":
      return {
        ...state,
        users: action.payload.users,
        events: action.payload.events,
        gallery: action.payload.gallery,
        files: action.payload.files,
        reports: action.payload.reports,
        pkkMembers: action.payload.pkkMembers.length ? action.payload.pkkMembers : state.pkkMembers,
        surat: action.payload.surat.length ? action.payload.surat : state.surat,
        inventory: action.payload.inventory.length ? action.payload.inventory : state.inventory,
        blogPosts: action.payload.blogPosts,
        orgPositions: action.payload.orgPositions,
        pengumuman: action.payload.pengumuman.length ? action.payload.pengumuman : state.pengumuman,
      };
    case "SET_ORG_POSITIONS":
      return { ...state, orgPositions: action.payload };
    case "SET_POST_MODAL":
      return { ...state, postModal: action.payload };
    case "SET_POST_FORM":
      return state.postModal ? { ...state, postModal: { ...state.postModal, form: { ...state.postModal.form, ...action.payload } } } : state;
    case "SET_BLOG_POSTS":
      return { ...state, blogPosts: action.payload };
    case "ADD_BLOG_POST":
      return { ...state, blogPosts: [action.payload, ...state.blogPosts] };
    case "UPDATE_BLOG_POST":
      return { ...state, blogPosts: state.blogPosts.map(p => p.id === action.payload.id ? action.payload : p) };
    case "DELETE_BLOG_POST":
      return { ...state, blogPosts: state.blogPosts.filter(p => p.id !== action.payload) };
    case "SET_VIEWING_POST":
      return { ...state, viewingPost: action.payload };
    case "ADD_PKK_MEMBER":
      return { ...state, pkkMembers: [...state.pkkMembers, action.payload], nextId: state.nextId + 1 };
    case "UPDATE_PKK_MEMBER":
      return { ...state, pkkMembers: state.pkkMembers.map(m => m.id === action.payload.id ? action.payload : m) };
    case "DELETE_PKK_MEMBER":
      return { ...state, pkkMembers: state.pkkMembers.filter(m => m.id !== action.payload) };
    case "SET_INVENTORY":
      return { ...state, inventory: action.payload };
    case "ADD_INVENTORY":
      return { ...state, inventory: [...state.inventory, { ...action.payload, children: [] }], nextId: state.nextId + 1 };
    case "UPDATE_INVENTORY": {
      const p = action.payload;
      function updTree(list: InventoryItem[]): InventoryItem[] {
        return list.map(m => {
          if (m.id === p.id) return { ...p, children: m.children };
          if (m.children) return { ...m, children: updTree(m.children) };
          return m;
        });
      }
      return { ...state, inventory: updTree(state.inventory) };
    }
    case "DELETE_INVENTORY": {
      const id = action.payload;
      function delTree(list: InventoryItem[]): InventoryItem[] {
        return list.filter(m => {
          if (m.id === id) return false;
          if (m.children) m.children = delTree(m.children);
          return true;
        });
      }
      return { ...state, inventory: delTree(state.inventory) };
    }
    case "ADD_INVENTORY_CHILD": {
      const payload = action.payload;
      function addChildTree(list: InventoryItem[]): InventoryItem[] {
        return list.map(m => {
          if (m.id === payload.parentId) {
            return { ...m, children: [...(m.children || []), payload.item] };
          }
          if (m.children) return { ...m, children: addChildTree(m.children) };
          return m;
        });
      }
      return { ...state, inventory: addChildTree(state.inventory), nextId: state.nextId + 1 };
    }
    case "SET_SURAT":
      return { ...state, surat: action.payload };
    case "ADD_SURAT":
      return { ...state, surat: [...state.surat, action.payload], nextId: state.nextId + 1 };
    case "UPDATE_SURAT":
      return { ...state, surat: state.surat.map(m => m.id === action.payload.id ? action.payload : m) };
    case "DELETE_SURAT":
      return { ...state, surat: state.surat.filter(m => m.id !== action.payload) };
    case "SET_SURAT_VIEW":
      return { ...state, suratView: action.payload };
    case "SET_PENGUMUMAN":
      return { ...state, pengumuman: action.payload };
    case "ADD_PENGUMUMAN":
      return { ...state, pengumuman: [...(state.pengumuman || []), action.payload], nextId: state.nextId + 1 };
    case "UPDATE_PENGUMUMAN":
      return { ...state, pengumuman: (state.pengumuman || []).map(p => p.id === action.payload.id ? action.payload : p) };
    case "DELETE_PENGUMUMAN":
      return { ...state, pengumuman: (state.pengumuman || []).filter(p => p.id !== action.payload) };
    case "SET_TOAST":
      return { ...state, toast: action.payload };
    default:
      return state;
  }
}

// Helpers
export function rlabel(u: User | null): string {
  if (!u) return "";
  if (u.role === "admin") return "Sekretaris";
  const p = POKJA.find((x) => x.id === u.pokja);
  return (u.role === "ketua" ? "Ketua " : "Anggota ") + (p ? p.name : "");
}

export function raccent(u: User | null): string {
  if (!u || u.role === "admin") return "#0f172a";
  const p = POKJA.find((x) => x.id === u.pokja);
  return p ? p.accent : "#2c9a55";
}

export function rinit(u: User): string {
  return u.name ? u.name[0].toUpperCase() : "?";
}

export function canEditPokja(u: User | null, pokjaId: number): boolean {
  if (!u) return false;
  if (u.role === "admin") return true;
  return u.pokja === pokjaId && (u.role === "ketua" || u.role === "anggota");
}

export function makeAvatarStyle(
  avatar: string | null,
  accent: string,
  size: string,
  fontSize: string,
  initial: string,
): React.CSSProperties {
  if (avatar) {
    return {
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundImage: `url('${avatar}')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      flexShrink: 0,
    };
  }
  return {
    width: size,
    height: size,
    borderRadius: "50%",
    background: accent,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize,
    fontWeight: "800",
    flexShrink: 0,
  };
}
