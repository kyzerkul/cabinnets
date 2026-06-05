import Link from 'next/link'
import type { NearbyCityResult } from '@/lib/cities'

interface VillesVoisinesProps {
  cities: NearbyCityResult[]
}

export function VillesVoisines({ cities }: VillesVoisinesProps) {
  if (cities.length === 0) return null

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Villes voisines</h2>
      <ul className="space-y-1">
        {cities.map((city) => (
          <li key={city.key} className="flex items-center justify-between gap-2">
            <Link
              href={`/cabinets-comptables/${city.key}`}
              className="text-sm hover:underline text-foreground"
            >
              Cabinets comptables à {city.name}
            </Link>
            <span className="text-xs text-muted-foreground shrink-0">
              {city.distanceKm.toFixed(0)} km · {city.cabinetCount} cab.
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
