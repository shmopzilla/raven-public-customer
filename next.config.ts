import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ryuslexclvyohxagztys.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  typescript: {
    // TODO: Fix type errors and remove this
    ignoreBuildErrors: true,
  },
  eslint: {
    // TODO: Resolve `any`/unused-var warnings in src/lib/supabase/* and remove this
    ignoreDuringBuilds: true,
  },
  // Note: CORS is handled by middleware.ts for API routes
};

export default nextConfig;
