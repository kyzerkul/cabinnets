import { Phone, Globe, MapPin, Building2 } from 'lucide-react'
import type { CabinetWithRelations } from '@/lib/types'

function getSiteHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

interface ContactBlockProps {
  cabinet: CabinetWithRelations
}

export function ContactBlock({ cabinet }: ContactBlockProps) {
  return (
    <div className="rounded-lg border bg-card p-5 space-y-4">
      <h2 className="font-semibold">Coordonnées</h2>

      {cabinet.phoneE164 && (
        <div className="flex items-start gap-3">
          <Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" aria-hidden="true" />
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Téléphone</p>
            <a href={`tel:${cabinet.phoneE164}`} className="text-sm font-medium hover:underline">
              {cabinet.phoneDisplay ?? cabinet.phoneE164}
            </a>
          </div>
        </div>
      )}

      {cabinet.url && (
        <div className="flex items-start gap-3">
          <Globe className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" aria-hidden="true" />
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Site web</p>
            <a
              href={cabinet.url}
              rel="nofollow noopener noreferrer"
              target="_blank"
              className="text-sm font-medium hover:underline break-all"
            >
              {getSiteHost(cabinet.url)}
            </a>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" aria-hidden="true" />
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Adresse</p>
          <p className="text-sm">{cabinet.address}</p>
        </div>
      </div>

      {cabinet.siren && (
        <div className="flex items-start gap-3">
          <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" aria-hidden="true" />
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">SIREN</p>
            <p className="text-sm font-mono">{cabinet.siren}</p>
            {cabinet.formeJuridiqueLabel && (
              <p className="text-xs text-muted-foreground mt-0.5">{cabinet.formeJuridiqueLabel}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
