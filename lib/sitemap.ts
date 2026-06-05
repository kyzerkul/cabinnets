export const BUILD_DATE = new Date().toISOString().slice(0, 10)

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
