import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vrprbxhnjsamjmcncizn.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  typescript: {
    // TODO: Fix type errors and remove this
    ignoreBuildErrors: true,
  },
  // Note: CORS is handled by middleware.ts for API routes
};

export default nextConfig;
