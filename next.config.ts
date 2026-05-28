import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output bundles everything needed to run without a separate npm install.
  // This is the recommended deployment mode for Azure App Service.
  output: "standalone",

  images: {
    remotePatterns: [
      {
        // Azure Blob Storage — announcement images
        protocol: 'https',
        hostname: '*.blob.core.windows.net',
        pathname: '/announcements/**',
      },
    ],
  },
};

export default nextConfig;
