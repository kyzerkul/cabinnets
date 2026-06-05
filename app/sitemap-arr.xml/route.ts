import { getAllParisArrKeys } from '@/lib/cities'
import { canonicalUrl } from '@/lib/seo'
import { xmlUrlEntry, xmlUrlset } from '@/lib/sitemap'

export const dynamic = 'force-static'

const BUILD_DATE = new Date().toISOString().slice(0, 10)

export async function GET() {
  const keys = await getAllParisArrKeys()
  const entries = keys.map((key) =>
    xmlUrlEntry(canonicalUrl(`/cabinets-comptables/${key}`), BUILD_DATE, 0.8),
  )
  return new Response(xmlUrlset(entries), {
    headers: { 'Content-Type': 'application/xml' },
  })
}
