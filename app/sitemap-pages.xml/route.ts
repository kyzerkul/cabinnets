import { canonicalUrl } from '@/lib/seo'
import { BUILD_DATE, SITEMAP_HEADERS, xmlUrlEntry, xmlUrlset } from '@/lib/sitemap'

export const dynamic = 'force-static'

// Every indexable non-listing page. The legal pages belong here too: they are
// linked from the footer on every page and they are what a search engine reads
// to establish who publishes the directory (E-E-A-T), so leaving them out of
// the sitemap was a wasted trust signal.
const STATIC_PAGES: { path: string; priority: number }[] = [
  { path: '/', priority: 1.0 },
  { path: '/cabinets-comptables/departements', priority: 0.7 },
  { path: '/demander-un-devis', priority: 0.6 },
  { path: '/mentions-legales', priority: 0.2 },
  { path: '/confidentialite', priority: 0.2 },
  { path: '/cgu', priority: 0.2 },
]

export function GET() {
  const entries = STATIC_PAGES.map(({ path, priority }) =>
    xmlUrlEntry(canonicalUrl(path), BUILD_DATE, priority),
  )
  return new Response(xmlUrlset(entries), { headers: SITEMAP_HEADERS })
}
