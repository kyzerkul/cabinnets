import { Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const BENEFITS = [
  'Gratuit et sans engagement',
  'Experts-comptables vérifiés',
  'Comparaison simplifiée',
  'Service disponible prochainement',
]

export function WhyUseSidebar() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Pourquoi utiliser ce service ?</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm">
              <Check className="size-4 mt-0.5 text-primary shrink-0" aria-hidden="true" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
