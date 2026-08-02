import type { Metadata } from "next";
import App from "@/components/App";
import { createClient } from '@supabase/supabase-js';
import { POKJA } from '@/lib/constants';
import { blogPostPath } from '@/lib/routes';

export const revalidate = 3600;

const baseUrl = "https://pkk.bunutwetan.id";

const STATIC_SLUGS: string[][] = [
  ['home'],
  ['pkk'],
  ['pkk', 'pokja-1'],
  ['pkk', 'pokja-2'],
  ['pkk', 'pokja-3'],
  ['pkk', 'pokja-4'],
  ['galeri'],
  ['pengumuman'],
  ['inovasi'],
  ['inovasi', 'editor'],
  ['kalender'],
  ['laporan'],
  ['anggota'],
  ['inventaris'],
  ['surat'],
  ['arsip'],
  ['dasbor'],
];

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  const params: { slug: string[] }[] = STATIC_SLUGS.map((slug) => ({ slug }));

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (supabaseUrl && supabaseKey) {
      const sb = createClient(supabaseUrl, supabaseKey);
      const { data: posts } = await sb.from('blog_posts').select('id, title, created_at');
      if (posts) {
        for (const post of posts) {
          const path = blogPostPath({ ...post, date: post.created_at });
          const slug = path.replace(/^\//, '').split('/');
          if (slug.length > 1) params.push({ slug });
        }
      }
    }
  } catch {
    // static routes are still generated without the database
  }

  return params;
}

const PAGE_META: Record<string, { title: string; description: string }> = {
  '/home': {
    title: 'Beranda',
    description: 'Halaman utama PKK Desa Bunut Wetan — informasi terbaru seputar kegiatan dan program PKK.',
  },
  '/': {
    title: 'Beranda',
    description: 'Halaman utama PKK Desa Bunut Wetan — informasi terbaru seputar kegiatan dan program PKK.',
  },
  '/pkk': {
    title: 'Pokja PKK',
    description: 'Informasi lengkap mengenai 4 Pokja PKK Desa Bunut Wetan beserta program kerja masing-masing.',
  },
  '/galeri': {
    title: 'Galeri',
    description: 'Galeri foto dan dokumentasi kegiatan PKK Desa Bunut Wetan.',
  },
  '/pengumuman': {
    title: 'Pengumuman',
    description: 'Pengumuman dan informasi terbaru dari PKK Desa Bunut Wetan.',
  },
  '/inovasi': {
    title: 'Inovasi',
    description: 'Kumpulan artikel inovasi dan berita terbaru seputar PKK Desa Bunut Wetan.',
  },
  '/kalender': {
    title: 'Kalender',
    description: 'Kalender kegiatan dan agenda PKK Desa Bunut Wetan.',
  },
  '/laporan': {
    title: 'Laporan',
    description: 'Laporan kegiatan dan pengaduan masyarakat untuk PKK Desa Bunut Wetan.',
  },
  '/anggota': {
    title: 'Anggota PKK',
    description: 'Daftar anggota PKK Desa Bunut Wetan lengkap dengan jabatan dan kepengurusan.',
  },
  '/inventaris': {
    title: 'Inventaris',
    description: 'Data inventaris barang milik PKK Desa Bunut Wetan.',
  },
  '/surat': {
    title: 'Surat Masuk & Keluar',
    description: 'Administrasi surat masuk dan surat keluar PKK Desa Bunut Wetan.',
  },
  '/arsip': {
    title: 'Arsip',
    description: 'Arsip dokumen dan berkas-berkas PKK Desa Bunut Wetan.',
  },
  '/dasbor': {
    title: 'Dasbor',
    description: 'Dasbor administrasi PKK Desa Bunut Wetan.',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const path = '/' + slug.join('/');

  const staticMeta = PAGE_META[path];
  if (staticMeta) {
    return {
      title: staticMeta.title,
      description: staticMeta.description,
      openGraph: { title: staticMeta.title, description: staticMeta.description, url: `${baseUrl}${path}` },
    };
  }

  if (path.startsWith('/pkk/pokja-')) {
    const n = parseInt(path.replace('/pkk/pokja-', ''), 10);
    const pokja = POKJA.find(p => p.id === n);
    if (pokja) {
      const title = `${pokja.name} — ${pokja.title}`;
      const description = `Informasi lengkap ${pokja.name}: ${pokja.title} — ${pokja.sub}. Program kerja dan kegiatan PKK Desa Bunut Wetan.`;
      return { title, description, openGraph: { title, description, url: `${baseUrl}${path}` } };
    }
  }

  if (path.startsWith('/inovasi/') && slug.length >= 3) {
    const datePart = slug[1];
    const slugPart = slug.slice(2).join('/');
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart) && slugPart) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseKey) {
        try {
          const sb = createClient(supabaseUrl, supabaseKey);
          const posts = await sb.from('blog_posts').select('title, excerpt');
          const allPosts = posts.data || [];
          const decodedSlug = slugPart.replace(/-/g, ' ');
          const post = allPosts.find(
            (p: any) => p.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-') === slugPart
          );
          if (post) {
            const title = post.title;
            const description = post.excerpt || `Baca artikel ${post.title} di PKK Desa Bunut Wetan.`;
            return { title, description, openGraph: { title, description, url: `${baseUrl}${path}` } };
          }
        } catch {}
      }
    }
  }

  return {};
}

export default async function CatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const initialPath = '/' + slug.join('/');

  return <App initialPath={initialPath} />;
}
