import { getAllDeptCodes, getDept } from '@/lib/cities'
import { canonicalUrl } from '@/lib/seo'
import { xmlUrlEntry, xmlUrlset } from '@/lib/sitemap'

export const dynamic = 'force-static'

const BUILD_DATE = new Date().toISOString().slice(0, 10)

export async function GET() {
  const codes = await getAllDeptCodes()
  const depts = await Promise.all(codes.map((c) => getDept(c)))
  const entries = depts
    .filter((d): d is NonNullable<typeof d> => d !== null)
    .map((d) =>
      xmlUrlEntry(
        canonicalUrl(`/cabinets-comptables/departement/${d.slug}`),
        BUILD_DATE,
        0.8,
      ),
    )
  return new Response(xmlUrlset(entries), {
    headers: { 'Content-Type': 'application/xml' },
  })
}
