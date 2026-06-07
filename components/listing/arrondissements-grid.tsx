import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatCityDisplay } from '@/lib/seo'

interface ArrItem {
  key: string
  zip: string
  cabinetCount: number
}

interface ArrondissementsGridProps {
  arrondissements: ArrItem[]
  currentKey: string
}

export function ArrondissementsGrid({ arrondissements, currentKey }: ArrondissementsGridProps) {
  return (
    <ul
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
      role="list"
    >
      {arrondissements.map((arr) => {
        const isCurrent = arr.key === currentKey
        const label = formatCityDisplay({ key: arr.key, zip: arr.zip, name: '' })
        return (
          <li key={arr.key}>
            {isCurrent ? (
              <span
                className="flex items-center justify-between rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium"
                aria-current="page"
              >
                <span className="truncate">{label}</span>
                <Badge variant="secondary" className="ml-2 shrink-0 text-xs tabular-nums">
                  {arr.cabinetCount}
                </Badge>
              </span>
            ) : (
              <Link
                href={`/cabinets-comptables/${arr.key}`}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary transition-colors"
              >
                <span className="font-medium truncate">{label}</span>
                <Badge variant="secondary" className="ml-2 shrink-0 text-xs tabular-nums">
                  {arr.cabinetCount}
                </Badge>
              </Link>
            )}
          </li>
        )
      })}
    </ul>
  )
}
