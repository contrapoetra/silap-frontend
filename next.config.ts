import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: [],
  },
  allowedDevOrigins: ['silap.contrapoetra.com'],
};

export default nextConfig;
