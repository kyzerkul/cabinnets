import { Badge } from '@/components/ui/badge'
import { SERVICES, SECTEURS } from '@/lib/taxonomies'

interface ServicesBadgesProps {
  services: string[]
  secteurs: string[]
  langues?: string[]
}

export function ServicesBadges({ services, secteurs, langues = [] }: ServicesBadgesProps) {
  if (services.length === 0 && secteurs.length === 0 && langues.length === 0) return null

  return (
    <div className="space-y-4">
      {services.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-2">Services proposés</h2>
          <div className="flex flex-wrap gap-2">
            {services.map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">
                {SERVICES[s] ?? s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {secteurs.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-2">Secteurs & clientèle</h2>
          <div className="flex flex-wrap gap-2">
            {secteurs.map((s) => (
              <Badge key={s} variant="outline" className="text-xs">
                {SECTEURS[s] ?? s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {langues.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-2">Langues parlées</h2>
          <div className="flex flex-wrap gap-2">
            {langues.map((l) => (
              <Badge key={l} variant="outline" className="text-xs capitalize">
                {l}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
