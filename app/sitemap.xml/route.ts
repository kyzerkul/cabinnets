import { siteUrl } from '@/lib/seo'
import { xmlSitemapEntry, xmlSitemapIndex } from '@/lib/sitemap'

export const dynamic = 'force-static'

const BUILD_DATE = new Date().toISOString().slice(0, 10)

export function GET() {
  const base = siteUrl()
  const sitemaps = [
    'sitemap-fiches.xml',
    'sitemap-villes.xml',
    'sitemap-arr.xml',
    'sitemap-depts.xml',
    'sitemap-regions.xml',
  ]
  const xml = xmlSitemapIndex(
    sitemaps.map((name) => xmlSitemapEntry(`${base}/${name}`, BUILD_DATE)),
  )
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } })
}
