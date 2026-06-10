import { getAllDeptCodes, getDept } from '@/lib/cities'
import { canonicalUrl } from '@/lib/seo'
import { BUILD_DATE, xmlUrlEntry, xmlUrlset } from '@/lib/sitemap'
import type { DeptWithRegion } from '@/lib/types'

export const dynamic = 'force-static'

export async function GET() {
  const codes = await getAllDeptCodes()
  const depts: (DeptWithRegion | null)[] = await Promise.all(codes.map((c) => getDept(c)))
  const deptEntries = depts
    .filter((d): d is DeptWithRegion => d !== null)
    .map((d) =>
      xmlUrlEntry(
        canonicalUrl(`/cabinets-comptables/departement/${d.slug}`),
        BUILD_DATE,
        0.8,
      ),
    )
  const indexEntry = xmlUrlEntry(
    canonicalUrl('/cabinets-comptables/departements'),
    BUILD_DATE,
    0.7,
  )
  return new Response(xmlUrlset([indexEntry, ...deptEntries]), {
    headers: { 'Content-Type': 'application/xml' },
  })
}
