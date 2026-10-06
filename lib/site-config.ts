// Single source of truth for the site's public origin.
//
// This module is imported by next.config.ts as well as by the app, so it must
// stay free of imports that pull in Prisma, React or the `@/` path alias.

/**
 * The one production origin, verified against the live deployment:
 *
 *     https://cabinetscomptables.online      → 308 → https://www.cabinetscomptables.online
 *     https://www.cabinetscomptables.online  → 200
 *
 * This is deliberately a constant rather than an environment variable.
 *
 * For a single-domain site the canonical host is a property of the project, not
 * of a particular deployment, and a hidden dashboard field turned out to be the
 * wrong place to keep it: it sat on the apex for a month without anyone
 * noticing. Every canonical, og:url, JSON-LD @id and sitemap <loc> then named a
 * URL that 308s — Google kept landing on www, being told the real page was on
 * the apex, following that, and being sent back to www. The signal is
 * unresolvable, and ~3 100 pages stayed out of the index.
 *
 * In the repository the value is reviewed, versioned, diffable, and checked on
 * every run of `npm run seo:check`. If the site ever moves to another domain,
 * change this line — not a dashboard field.
 */
export const PRODUCTION_ORIGIN = 'https://www.cabinetscomptables.online'

/** Used by `next dev`, and by `next build && next start` on a developer machine. */
export const DEV_ORIGIN = 'http://localhost:3000'

/** True on a Vercel build or runtime (production AND preview deployments). */
function isDeployed(): boolean {
  return Boolean(process.env.VERCEL)
}

function normalize(raw: string | undefined): string {
  return typeof raw === 'string' ? raw.trim().replace(/\/+$/, '') : ''
}

/**
 * Resolves the origin every absolute URL on the site is built from.
 *
 * On a deployment, PRODUCTION_ORIGIN always wins — NEXT_PUBLIC_SITE_URL cannot
 * silently redirect the whole site at a host that 308s. A disagreement is
 * reported in the build log rather than applied, so a deliberate domain change
 * is still visible instead of being swallowed.
 *
 * Off a deployment, NEXT_PUBLIC_SITE_URL is honoured when it is a valid
 * absolute origin (so `next start` against localhost, and seo:check against it,
 * both keep working), and otherwise the dev origin is used.
 */
export function resolveSiteOrigin(): string {
  const configured = normalize(process.env.NEXT_PUBLIC_SITE_URL)

  if (isDeployed()) {
    if (configured && configured !== PRODUCTION_ORIGIN) {
      console.warn(
        `[seo] NEXT_PUBLIC_SITE_URL is "${configured}" but the canonical origin is ` +
          `"${PRODUCTION_ORIGIN}" (lib/site-config.ts). Using the constant. ` +
          'Remove or correct the environment variable to silence this; if the site ' +
          'genuinely moved, change PRODUCTION_ORIGIN instead.',
      )
    }
    return PRODUCTION_ORIGIN
  }

  if (/^https?:\/\//.test(configured)) return configured
  return DEV_ORIGIN
}
