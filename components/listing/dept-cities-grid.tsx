import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface CityItem {
  key: string
  name: string
  zip: string
  cabinetCount: number
}

interface DeptCitiesGridProps {
  cities: CityItem[]
}

export function DeptCitiesGrid({ cities }: DeptCitiesGridProps) {
  const sorted = [...cities].sort(
    (a, b) => b.cabinetCount - a.cabinetCount || a.name.localeCompare(b.name, 'fr'),
  )

  return (
    <ul
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
      role="list"
    >
      {sorted.map((city) => (
        <li key={city.key}>
          <Link
            href={`/cabinets-comptables/${city.key}`}
            className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary transition-colors"
          >
            <span className="font-medium truncate">{city.name}</span>
            <Badge variant="secondary" className="ml-2 shrink-0 text-xs tabular-nums">
              {city.cabinetCount}
            </Badge>
          </Link>
        </li>
      ))}
    </ul>
  )
}
