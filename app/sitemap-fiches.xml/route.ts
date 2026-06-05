import { getAllCabinetSlugs } from '@/lib/cabinets'
import { canonicalUrl } from '@/lib/seo'
import { xmlUrlEntry, xmlUrlset } from '@/lib/sitemap'

export const dynamic = 'force-static'

const BUILD_DATE = new Date().toISOString().slice(0, 10)

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
