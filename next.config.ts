import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Show real errors in development
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
  },
  // Don't hide errors during development
  productionBrowserSourceMaps: true,
  /* config options here */
  experimental: {
    viewTransition: true,
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hybwgmvzmoqsqozbtjyh.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
