import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc', // Ganti dengan domain gambar Anda
        port: '',
        pathname: '/**', // Mengizinkan semua folder di domain tersebut
      },
    ],
  },
};

export default nextConfig;
