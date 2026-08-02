import type { Metadata } from "next";
import App from "@/components/App";

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: "Beranda",
  description: "Halaman utama PKK Desa Bunut Wetan — informasi terbaru seputar kegiatan dan program PKK.",
  openGraph: {
    title: "PKK Desa Bunut Wetan",
    description: "Halaman utama PKK Desa Bunut Wetan — informasi terbaru seputar kegiatan dan program PKK.",
    url: "https://pkk.bunutwetan.id",
  },
};

export default function Home() {
  return <App initialPath="/" />;
}
