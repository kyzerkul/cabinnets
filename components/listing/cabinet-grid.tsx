import { CabinetCard } from '@/components/cabinet/cabinet-card'
import type { CabinetWithCity } from '@/lib/types'

interface CabinetGridProps {
  cabinets: CabinetWithCity[]
}

export function CabinetGrid({ cabinets }: CabinetGridProps) {
  if (cabinets.length === 0) return null
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {cabinets.map((cabinet) => (
        <CabinetCard key={cabinet.placeId} cabinet={cabinet} />
      ))}
    </div>
  )
}
