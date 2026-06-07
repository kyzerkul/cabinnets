'use client'

import { useState } from 'react'
import { CabinetCard } from '@/components/cabinet/cabinet-card'
import { Button } from '@/components/ui/button'
import type { CabinetForCard } from '@/lib/types'

interface ExpandableCabinetGridProps {
  cabinets: CabinetForCard[]
  initialCount?: number
}

export function ExpandableCabinetGrid({ cabinets, initialCount = 12 }: ExpandableCabinetGridProps) {
  const [expanded, setExpanded] = useState(false)
  const displayed = expanded ? cabinets : cabinets.slice(0, initialCount)
  const hidden = cabinets.length - initialCount

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {displayed.map((cabinet) => (
          <CabinetCard key={cabinet.placeId} cabinet={cabinet} />
        ))}
      </div>
      {!expanded && hidden > 0 && (
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => setExpanded(true)}>
            Voir les {cabinets.length} cabinets de la région
          </Button>
        </div>
      )}
    </div>
  )
}
