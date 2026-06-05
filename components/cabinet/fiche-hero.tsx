import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { RatingStars } from '@/components/ui/rating-stars'
import { Container } from '@/components/ui/container'
import type { CabinetWithRelations } from '@/lib/types'
import { formatCityDisplay, formatZipShort } from '@/lib/seo'

interface FicheHeroProps {
  cabinet: CabinetWithRelations
}

export function FicheHero({ cabinet }: FicheHeroProps) {
  const city = cabinet.city
  const ville = formatCityDisplay(city)
  const cp = formatZipShort(city, city.dptCode)

  return (
    <div className="border-b bg-card">
      <Container size="wide" className="py-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {cabinet.imageLogoPath && (
            <Image
              src={cabinet.imageLogoPath}
              alt={`Logo ${cabinet.title}`}
              width={96}
              height={96}
              className="rounded-lg object-cover border shrink-0"
              priority
            />
          )}

          <div className="flex-1 min-w-0">
            {cabinet.featured && (
              <Badge className="mb-2 bg-amber-100 text-amber-800 border-amber-200 text-xs">
                Cabinet mis en avant
              </Badge>
            )}

            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              {cabinet.title}
            </h1>

            <p className="text-muted-foreground mt-1">
              Expert-comptable à <span className="text-foreground font-medium">{ville}</span>{' '}
              <span className="text-sm">({cp})</span>
            </p>

            {cabinet.ratingValue && cabinet.ratingCount && cabinet.ratingCount > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <RatingStars rating={cabinet.ratingValue} count={cabinet.ratingCount} />
                <span className="text-sm text-muted-foreground">
                  {cabinet.ratingValue.toFixed(1)}/5
                </span>
              </div>
            )}

            <p className="text-sm text-muted-foreground mt-2">{cabinet.address}</p>
          </div>
        </div>
      </Container>
    </div>
  )
}
