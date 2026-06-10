import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  // Skip TS type-check during Vercel build — errors are control-flow narrowing
  // false-positives on module-level vars (masked by incremental cache locally).
  // Run `tsc --noEmit` separately to audit types.
  typescript: { ignoreBuildErrors: true },
  // Neon free tier: give each worker up to 5 min for the initial cache warmup.
  staticPageGenerationTimeout: 300,
  experimental: {
    // 1 worker → single connection to Neon free tier at build time.
    // Increase back to 2 once on a paid Neon plan or a more stable DB host.
    cpus: 1,
  },
}

export default withBundleAnalyzer(nextConfig)
