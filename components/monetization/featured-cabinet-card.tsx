import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CabinetForCard } from '@/lib/types'
import { formatCityDisplay } from '@/lib/seo'

interface FeaturedCabinetCardProps {
  cabinet: CabinetForCard
}

export function FeaturedCabinetCard({ cabinet }: FeaturedCabinetCardProps) {
  const href = `/expert-comptable/${cabinet.cityKey}/${cabinet.slug}`
  const ville = formatCityDisplay(cabinet.city)

  return (
    <Link
      href={href}
      className="group flex gap-4 rounded-lg border border-amber-200 border-l-4 border-l-amber-400 bg-amber-50 p-4 hover:border-amber-300 transition-colors"
    >
      {cabinet.imageLogoPath ? (
        <Image
          src={cabinet.imageLogoPath}
          alt={`Logo ${cabinet.title}`}
          width={56}
          height={56}
          className="rounded-md object-cover shrink-0 self-start"
        />
      ) : (
        <div className="w-14 h-14 rounded-md bg-amber-100 flex items-center justify-center shrink-0 self-start text-sm font-semibold text-amber-700">
          {cabinet.title.slice(0, 2).toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-sm leading-snug group-hover:underline">
            {cabinet.title}
          </h3>
          <Badge className="bg-amber-100 text-amber-700 border border-amber-200 text-xs shrink-0">
            Mis en avant
          </Badge>
        </div>

        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>{ville}</span>
        </div>

        {cabinet.ratingCount != null && cabinet.ratingCount > 0 && (
          <div className="flex items-center gap-1 mt-1 text-xs">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="font-medium">{(cabinet.ratingValue ?? 0).toFixed(1)}</span>
            <span className="text-muted-foreground">({cabinet.ratingCount} avis)</span>
          </div>
        )}

        {cabinet.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{cabinet.description}</p>
        )}
      </div>

      <span
        className={cn(
          buttonVariants({ variant: 'outline', size: 'sm' }),
          'shrink-0 self-center hidden sm:inline-flex',
        )}
        aria-hidden="true"
      >
        Voir la fiche
      </span>
    </Link>
  )
}
