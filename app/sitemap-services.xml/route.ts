import { getAllSpecialiteParams } from '@/lib/taxonomies'
import { canonicalUrl } from '@/lib/seo'
import { BUILD_DATE, SITEMAP_HEADERS, xmlUrlEntry, xmlUrlset } from '@/lib/sitemap'

export const dynamic = 'force-static'

export function GET() {
  const params = getAllSpecialiteParams()
  const entries = params.map(({ slug }) =>
    xmlUrlEntry(canonicalUrl(`/recherche/${slug}`), BUILD_DATE, 0.6),
  )
  return new Response(xmlUrlset(entries), { headers: SITEMAP_HEADERS })
}
