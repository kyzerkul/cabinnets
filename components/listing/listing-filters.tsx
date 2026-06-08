'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { CabinetGrid } from '@/components/listing/cabinet-grid'
import { SERVICES } from '@/lib/taxonomies'
import type { CabinetForCard } from '@/lib/types'

type SortOption = 'default' | 'rating' | 'votes'

interface ListingFiltersProps {
  cabinets: CabinetForCard[]
}

function extractServiceKeys(cabinets: CabinetForCard[]): string[] {
  const keys = new Set<string>()
  for (const c of cabinets) {
    for (const s of c.services) {
      if (s in SERVICES) keys.add(s)
    }
  }
  return Array.from(keys).sort()
}

function sortCabinets(cabinets: CabinetForCard[], sort: SortOption): CabinetForCard[] {
  const copy = [...cabinets]
  if (sort === 'rating') {
    return copy.sort((a, b) => {
      const d = (b.ratingValue ?? 0) - (a.ratingValue ?? 0)
      return d !== 0 ? d : (b.ratingCount ?? 0) - (a.ratingCount ?? 0)
    })
  }
  if (sort === 'votes') {
    return copy.sort((a, b) => {
      const d = (b.ratingCount ?? 0) - (a.ratingCount ?? 0)
      return d !== 0 ? d : (b.ratingValue ?? 0) - (a.ratingValue ?? 0)
    })
  }
  // default: featured → ratingValue → ratingCount (mirrors SORT in lib/cabinets.ts)
  return copy.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    const d = (b.ratingValue ?? 0) - (a.ratingValue ?? 0)
    return d !== 0 ? d : (b.ratingCount ?? 0) - (a.ratingCount ?? 0)
  })
}

export function ListingFilters({ cabinets }: ListingFiltersProps) {
  const [sort, setSort] = useState<SortOption>('default')
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  const availableServices = useMemo(() => extractServiceKeys(cabinets), [cabinets])

  const displayed = useMemo(() => {
    let result = cabinets
    if (selectedServices.length > 0) {
      result = result.filter((c) => selectedServices.some((s) => c.services.includes(s)))
    }
    return sortCabinets(result, sort)
  }, [cabinets, sort, selectedServices])

  function toggleService(key: string) {
    setSelectedServices((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key],
    )
  }

  const hasFiltersActive = sort !== 'default' || selectedServices.length > 0

  return (
    <div>
      {/* Barre filtres */}
      <div className="flex flex-wrap items-start gap-4 mb-6 pb-4 border-b">

        {/* Tri */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground shrink-0">Trier :</span>
          {(
            [
              ['default', 'Par défaut'],
              ['rating', 'Meilleure note'],
              ['votes', "Plus d'avis"],
            ] as [SortOption, string][]
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setSort(val)}
              aria-pressed={sort === val}
              className={cn(
                'px-3 py-1 text-sm rounded-full border transition-colors',
                sort === val
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:border-primary/50',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filtre services */}
        {availableServices.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground shrink-0">Services :</span>
            {availableServices.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleService(key)}
                aria-pressed={selectedServices.includes(key)}
                className={cn(
                  'px-3 py-1 text-sm rounded-full border transition-colors',
                  selectedServices.includes(key)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:border-primary/50',
                )}
              >
                {SERVICES[key]}
              </button>
            ))}
          </div>
        )}

        {/* Réinitialiser */}
        {hasFiltersActive && (
          <button
            type="button"
            onClick={() => {
              setSort('default')
              setSelectedServices([])
            }}
            className="text-sm text-muted-foreground underline-offset-2 hover:underline ml-auto self-center"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Compteur résultats */}
      <p className="text-sm text-muted-foreground mb-4">
        {displayed.length === cabinets.length
          ? `${cabinets.length} cabinet${cabinets.length !== 1 ? 's' : ''}`
          : `${displayed.length} sur ${cabinets.length} cabinet${cabinets.length !== 1 ? 's' : ''}`}
      </p>

      {/* Grille résultats */}
      {displayed.length > 0 ? (
        <CabinetGrid cabinets={displayed} />
      ) : (
        <p className="text-muted-foreground text-center py-12">
          Aucun cabinet ne correspond aux filtres sélectionnés.
        </p>
      )}
    </div>
  )
}
