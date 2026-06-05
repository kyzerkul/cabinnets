import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { RatingStars } from '@/components/ui/rating-stars'
import type { CabinetWithCity } from '@/lib/types'
import { formatCityDisplay } from '@/lib/seo'

interface CabinetCardProps {
  cabinet: CabinetWithCity
  distanceKm?: number
}

export function CabinetCard({ cabinet, distanceKm }: CabinetCardProps) {
  const href = `/expert-comptable/${cabinet.cityKey}/${cabinet.slug}`
  const ville = formatCityDisplay(cabinet.city)

  return (
    <Link
      href={href}
      className="group flex flex-col rounded-lg border bg-card p-4 hover:border-foreground/20 transition-colors"
    >
      <div className="flex items-start gap-3">
        {cabinet.imageLogoPath ? (
          <Image
            src={cabinet.imageLogoPath}
            alt={`Logo ${cabinet.title}`}
            width={48}
            height={48}
            className="rounded-md object-cover shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center shrink-0 text-xs font-semibold text-muted-foreground">
            {cabinet.title.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-sm leading-snug group-hover:underline line-clamp-2">
            {cabinet.title}
          </h3>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span>{ville}</span>
            {distanceKm !== undefined && (
              <span>· {distanceKm < 1 ? '<1' : distanceKm.toFixed(0)} km</span>
            )}
          </div>
        </div>
        {cabinet.featured && (
          <Badge variant="secondary" className="ml-auto shrink-0 text-xs">
            En avant
          </Badge>
        )}
      </div>

      {cabinet.ratingValue && cabinet.ratingCount && cabinet.ratingCount > 0 && (
        <div className="mt-2">
          <RatingStars rating={cabinet.ratingValue} count={cabinet.ratingCount} />
        </div>
      )}

      {cabinet.description && (
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{cabinet.description}</p>
      )}
    </Link>
  )
}
