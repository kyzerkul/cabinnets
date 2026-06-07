import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface DeptItem {
  code: string
  name: string
  slug: string
  cabinetCount: number
}

interface RegionDeptsGridProps {
  depts: DeptItem[]
}

export function RegionDeptsGrid({ depts }: RegionDeptsGridProps) {
  const sorted = [...depts].sort(
    (a, b) => b.cabinetCount - a.cabinetCount || a.name.localeCompare(b.name, 'fr'),
  )

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2" role="list">
      {sorted.map((dept) => (
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
  )
}
