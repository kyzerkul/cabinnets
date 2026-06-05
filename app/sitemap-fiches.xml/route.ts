import { getAllCabinetSlugs } from '@/lib/cabinets'
import { canonicalUrl } from '@/lib/seo'
import { BUILD_DATE, xmlUrlEntry, xmlUrlset } from '@/lib/sitemap'

export const dynamic = 'force-static'

export async function GET() {
  const slugs = await getAllCabinetSlugs()
  const entries = slugs.map(({ slug, cityKey }) =>
    xmlUrlEntry(
      canonicalUrl(`/expert-comptable/${cityKey}/${slug}`),
      BUILD_DATE,
      0.7,
    ),
  )
  return new Response(xmlUrlset(entries), {
    headers: { 'Content-Type': 'application/xml' },
  })
}
