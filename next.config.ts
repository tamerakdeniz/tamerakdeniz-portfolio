import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.firebasestorage.app',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        has: [{ type: 'query', key: 'view', value: 'recruiter' }],
        destination: '/resume',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
