import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint during production builds (e.g., on Vercel)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
