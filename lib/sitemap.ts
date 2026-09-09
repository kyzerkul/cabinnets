// Fallback lastmod for pages that have no per-row timestamp (listings, static
// pages). Stamped once at build time.
export const BUILD_DATE = new Date().toISOString().slice(0, 10)

export function isoDate(value: Date | string | null | undefined): string {
  if (!value) return BUILD_DATE
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? BUILD_DATE : d.toISOString().slice(0, 10)
}

export function xmlUrlEntry(
  loc: string,
  lastmod: string,
  priority: number,
): string {
  return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><priority>${priority.toFixed(1)}</priority></url>`
}

export function xmlUrlset(entries: string[]): string {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    entries.join('') +
    `</urlset>`
  )
}

export function xmlSitemapEntry(loc: string, lastmod: string): string {
  return `<sitemap><loc>${loc}</loc><lastmod>${lastmod}</lastmod></sitemap>`
}

export function xmlSitemapIndex(entries: string[]): string {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    entries.join('') +
    `</sitemapindex>`
  )
}

// Sitemaps are served as static files; without this they are cached by the CDN
// with no revalidation hint and can go stale between deploys.
export const SITEMAP_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
} as const
