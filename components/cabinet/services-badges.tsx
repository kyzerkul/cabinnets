import Link from 'next/link'
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
            {services.map((s) =>
              s in SERVICES ? (
                <Link key={s} href={`/recherche/expert-comptable-${s}`}>
                  <Badge variant="secondary" className="text-xs cursor-pointer">
                    {SERVICES[s]}
                  </Badge>
                </Link>
              ) : (
                <Badge key={s} variant="secondary" className="text-xs">
                  {s}
                </Badge>
              ),
            )}
          </div>
        </div>
      )}

      {secteurs.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-2">Secteurs & clientèle</h2>
          <div className="flex flex-wrap gap-2">
            {secteurs.map((s) =>
              s in SECTEURS ? (
                <Link key={s} href={`/recherche/expert-comptable-${s}`}>
                  <Badge variant="outline" className="text-xs cursor-pointer">
                    {SECTEURS[s]}
                  </Badge>
                </Link>
              ) : (
                <Badge key={s} variant="outline" className="text-xs">
                  {s}
                </Badge>
              ),
            )}
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
