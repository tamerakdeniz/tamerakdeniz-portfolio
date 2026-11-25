import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    ...(process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS === '1' ? { dangerouslyAllowLocalIP: true } : {}),
    remotePatterns: [
      ...(process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS === '1'
        ? [{ protocol: 'http' as const, hostname: '127.0.0.1', port: '9199', pathname: '/v0/b/demo-portfolio.appspot.com/o/**' }]
        : []),
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
