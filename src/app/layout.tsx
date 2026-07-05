import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PENDESA-P3S — Sistem Informasi Penguatan Desa Modul P3S Bunutwetan",
  description: "Sistem Informasi Penguatan Desa Modul P3S Bunutwetan",
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
