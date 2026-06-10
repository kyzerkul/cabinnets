import { getAllRegionCodes, getRegion } from '@/lib/cities'
import { canonicalUrl } from '@/lib/seo'
import { BUILD_DATE, xmlUrlEntry, xmlUrlset } from '@/lib/sitemap'

export const dynamic = 'force-static'

const STATIC_PAGES: { path: string; priority: number }[] = [
  { path: '/', priority: 1.0 },
  { path: '/demander-un-devis', priority: 0.5 },
]

export async function GET() {
  const codes = await getAllRegionCodes()
  const regions = await Promise.all(codes.map((c) => getRegion(c)))

  const regionEntries = regions
    .filter((r): r is NonNullable<Awaited<ReturnType<typeof getRegion>>> => r !== null)
    .map((r) =>
      xmlUrlEntry(
        canonicalUrl(`/cabinets-comptables/region/${r.slug}`),
        BUILD_DATE,
        0.8,
      ),
    )

  const staticEntries = STATIC_PAGES.map(({ path, priority }) =>
    xmlUrlEntry(canonicalUrl(path), BUILD_DATE, priority),
  )

  return new Response(xmlUrlset([...staticEntries, ...regionEntries]), {
    headers: { 'Content-Type': 'application/xml' },
  })
}
