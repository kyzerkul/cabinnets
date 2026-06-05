import { Badge } from '@/components/ui/badge'

interface ThinListingHeaderProps {
  cityDisplay: string
  zipShort: string
  localCount: number
  nearbyCount: number
}

export function ThinListingHeader({
  cityDisplay,
  zipShort,
  localCount,
  nearbyCount,
}: ThinListingHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
        Cabinets comptables à {cityDisplay} ({zipShort}) et environs
      </h1>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge variant="secondary">
          {localCount === 0 ? 'Aucun cabinet sur place' : `${localCount} sur place`}
        </Badge>
        {nearbyCount > 0 && (
          <Badge variant="secondary">{nearbyCount} à proximité (20 km)</Badge>
        )}
      </div>
      <p className="text-muted-foreground text-sm max-w-2xl">
        {localCount === 0
          ? `Aucun cabinet comptable référencé directement à ${cityDisplay}. Voici les plus proches dans un rayon de 20 km.`
          : `Seulement ${localCount} cabinet${localCount > 1 ? 's' : ''} à ${cityDisplay} — voici aussi les experts-comptables à proximité (rayon 20 km).`}
      </p>
    </div>
  )
}
