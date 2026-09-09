import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

// Host of the canonical origin, derived from the same variable that drives every
// canonical, og:url and sitemap <loc>. Null only when the variable is unset — in
// which case lib/seo.ts fails the build anyway.
function canonicalHost(): string | null {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? '').host
  } catch {
    return null
  }
}

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
    const host = canonicalHost()
    if (!host || host === VERCEL_PRODUCTION_ALIAS) return []
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
