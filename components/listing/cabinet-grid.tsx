import { CabinetCard } from '@/components/cabinet/cabinet-card'
import { FeaturedCabinetCard } from '@/components/monetization/featured-cabinet-card'
import type { CabinetForCard } from '@/lib/types'

interface CabinetGridProps {
  cabinets: (CabinetForCard & { distanceKm?: number })[]
}

export function CabinetGrid({ cabinets }: CabinetGridProps) {
  if (cabinets.length === 0) return null
  const ordered = [
    ...cabinets.filter((c) => c.featured),
    ...cabinets.filter((c) => !c.featured),
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {ordered.map((cabinet) =>
        cabinet.featured ? (
          <div key={cabinet.placeId} className="col-span-full">
            <FeaturedCabinetCard cabinet={cabinet} />
          </div>
        ) : (
          <CabinetCard key={cabinet.placeId} cabinet={cabinet} distanceKm={cabinet.distanceKm} />
        ),
      )}
    </div>
  )
}
