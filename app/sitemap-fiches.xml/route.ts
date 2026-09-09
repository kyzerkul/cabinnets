import { getAllCabinetSlugs } from '@/lib/cabinets'
import { canonicalUrl } from '@/lib/seo'
import { isoDate, SITEMAP_HEADERS, xmlUrlEntry, xmlUrlset } from '@/lib/sitemap'

export const dynamic = 'force-static'

export async function GET() {
  const slugs = await getAllCabinetSlugs()
  // Real per-record lastmod. Stamping every URL with the build date told Google
  // that all ~2 000 pages changed on every deploy, which makes it discount the
  // lastmod signal for the whole sitemap.
  const entries = slugs.map(({ slug, cityKey, updatedAt }) =>
    xmlUrlEntry(
      canonicalUrl(`/expert-comptable/${cityKey}/${slug}`),
      isoDate(updatedAt),
      0.7,
    ),
  )
  return new Response(xmlUrlset(entries), { headers: SITEMAP_HEADERS })
}
