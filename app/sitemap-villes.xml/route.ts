import { getAllCityKeys } from '@/lib/cities'
import { canonicalUrl } from '@/lib/seo'
import { xmlUrlEntry, xmlUrlset } from '@/lib/sitemap'

export const dynamic = 'force-static'

// Paris arrondissement keys match paris-750NN (e.g. paris-75001).
// paris-75 is the Paris global city page — kept here.
const PARIS_ARR_RE = /^paris-750\d{2}$/

const BUILD_DATE = new Date().toISOString().slice(0, 10)

export async function GET() {
  const keys = await getAllCityKeys()
  const entries = keys
    .filter((k) => !PARIS_ARR_RE.test(k))
    .map((key) =>
      xmlUrlEntry(canonicalUrl(`/cabinets-comptables/${key}`), BUILD_DATE, 0.8),
    )
  return new Response(xmlUrlset(entries), {
    headers: { 'Content-Type': 'application/xml' },
  })
}
