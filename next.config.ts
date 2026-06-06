import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Neon free tier: give each worker up to 5 min for the initial cache warmup.
  staticPageGenerationTimeout: 300,
  experimental: {
    // 2 workers → 2 concurrent large DB queries instead of 7.
    // Each worker loads all cabinets once, then serves 1500+ pages from memory.
    cpus: 2,
  },
};

export default nextConfig;
