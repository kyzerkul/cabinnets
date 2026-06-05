import { getAllParisArrKeys } from '@/lib/cities'
import { canonicalUrl } from '@/lib/seo'
import { BUILD_DATE, xmlUrlEntry, xmlUrlset } from '@/lib/sitemap'

export const dynamic = 'force-static'

export async function GET() {
  const keys = await getAllParisArrKeys()
  const entries = keys.map((key) =>
    xmlUrlEntry(canonicalUrl(`/cabinets-comptables/${key}`), BUILD_DATE, 0.8),
  )
  return new Response(xmlUrlset(entries), {
    headers: { 'Content-Type': 'application/xml' },
  })
}
