import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface DeptItem {
  code: string
  name: string
  slug: string
  cabinetCount: number
}

interface RegionGroup {
  regionName: string
  regionSlug: string
  depts: DeptItem[]
}

interface DeptsByRegionGridProps {
  regions: RegionGroup[]
}

export function DeptsByRegionGrid({ regions }: DeptsByRegionGridProps) {
  return (
    <div className="space-y-10">
      {regions.map((group) => (
        <section key={group.regionSlug}>
          <h2 className="text-lg font-semibold mb-4">
            <Link
              href={`/cabinets-comptables/region/${group.regionSlug}`}
              className="hover:underline underline-offset-2"
            >
              {group.regionName}
            </Link>
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2" role="list">
            {group.depts.map((dept) => (
                <li key={dept.code}>
                  <Link
                    href={`/cabinets-comptables/departement/${dept.slug}`}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary transition-colors"
                  >
                    <span className="font-medium truncate">
                      {dept.name} ({dept.code})
                    </span>
                    <Badge variant="secondary" className="ml-2 shrink-0 text-xs tabular-nums">
                      {dept.cabinetCount}
                    </Badge>
                  </Link>
                </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
