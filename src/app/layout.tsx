import type { Metadata } from "next";
import "./globals.css";

const baseUrl = "https://pkk.bunutwetan.id";

export const metadata: Metadata = {
  title: {
    default: "PKK Desa Bunut Wetan | Pemberdayaan Kesejahteraan Keluarga",
    template: "%s | PKK Desa Bunut Wetan",
  },
  description:
    "Website resmi PKK Desa Bunut Wetan. Informasi kegiatan, program kerja, struktur organisasi, dan berita terbaru seputar PKK.",
  keywords: [
    "PKK Bunut Wetan",
    "Bunut Wetan",
    "Desa Bunut Wetan",
    "PKK Malang",
    "Pemberdayaan Kesejahteraan Keluarga",
    "PENDESA-P3S",
  ],
  openGraph: {
    title: "PKK Desa Bunut Wetan",
    description:
      "Website resmi PKK Desa Bunut Wetan. Informasi kegiatan, program kerja, struktur organisasi, dan berita terbaru seputar PKK.",
    url: baseUrl,
    siteName: "PKK Bunut Wetan",
    locale: "id_ID",
    type: "website",
  },
  icons: [{ rel: "icon", url: "/pkk.png", type: "image/png" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased', color: '#1e293b' }}>{children}</body>
    </html>
  );
}
