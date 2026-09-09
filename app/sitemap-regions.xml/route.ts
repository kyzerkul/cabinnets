import { getAllRegionCodes, getRegion } from '@/lib/cities'
import { canonicalUrl } from '@/lib/seo'
import { BUILD_DATE, SITEMAP_HEADERS, xmlUrlEntry, xmlUrlset } from '@/lib/sitemap'
import type { Region } from '@/lib/types'

export const dynamic = 'force-static'

export async function GET() {
  const codes = await getAllRegionCodes()
  const regions: (Region | null)[] = await Promise.all(codes.map((c) => getRegion(c)))

  const regionEntries = regions
    .filter((r): r is Region => r !== null)
    .map((r) =>
      xmlUrlEntry(
        canonicalUrl(`/cabinets-comptables/region/${r.slug}`),
        BUILD_DATE,
        0.8,
      ),
    )

  return new Response(xmlUrlset(regionEntries), { headers: SITEMAP_HEADERS })
}
