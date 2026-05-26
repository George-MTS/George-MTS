import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  serverExternalPackages: ["@anthropic-ai/sdk"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

// CommonJS export so Vercel picks up the api.bodyParser setting
module.exports = nextConfig;
