import { siteUrl } from '@/lib/seo'
import { BUILD_DATE, SITEMAP_HEADERS, xmlSitemapEntry, xmlSitemapIndex } from '@/lib/sitemap'

export const dynamic = 'force-static'

export function GET() {
  const base = siteUrl()
  const sitemaps = [
    'sitemap-pages.xml',
    'sitemap-fiches.xml',
    'sitemap-villes.xml',
    'sitemap-arr.xml',
    'sitemap-depts.xml',
    'sitemap-regions.xml',
    'sitemap-services.xml',
  ]
  const xml = xmlSitemapIndex(
    sitemaps.map((name) => xmlSitemapEntry(`${base}/${name}`, BUILD_DATE)),
  )
  return new Response(xml, { headers: SITEMAP_HEADERS })
}
