import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'
import { PRODUCTION_ORIGIN } from './lib/site-config'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

// Vercel assigns the project's production *.vercel.app alias to Production and,
// unlike preview deployments, serves it WITHOUT a noindex header and WITHOUT a
// redirect. The whole ~2 000-page site is therefore reachable on a second
// indexable host — a complete duplicate competing with the real domain.
// Preview deployments get their own hostnames (…-git-<branch>-….vercel.app) and
// are deliberately left alone so branch previews keep working.
const VERCEL_PRODUCTION_ALIAS = process.env.VERCEL_PRODUCTION_ALIAS ?? 'cabinnets.vercel.app'

const nextConfig: NextConfig = {
  // Neon free tier: give each worker up to 5 min for the initial cache warmup.
  staticPageGenerationTimeout: 300,
  experimental: {
    // 1 worker → single connection to Neon free tier at build time.
    // Increase back to 2 once on a paid Neon plan or a more stable DB host.
    cpus: 1,
  },
  async redirects() {
    // Same constant the canonicals are built from, so the alias can never be
    // sent to a host that is not the one declared as canonical.
    const host = new URL(PRODUCTION_ORIGIN).host
    if (host === VERCEL_PRODUCTION_ALIAS) return []
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: VERCEL_PRODUCTION_ALIAS }],
        destination: `https://${host}/:path*`,
        permanent: true,
      },
    ]
  },
}

export default withBundleAnalyzer(nextConfig)
