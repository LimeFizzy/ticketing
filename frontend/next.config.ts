import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ['192.168.*.*', '*.local'],
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
};

export default nextConfig;
