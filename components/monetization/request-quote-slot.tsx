import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Phase 1 scaffold — CTA card linking to /demander-un-devis. Phase 2: inline form + Server Action.
export function RequestQuoteSlot() {
  return (
    <div className="rounded-lg border bg-amber-50 p-5 space-y-3">
      <h3 className="font-semibold">Demander un devis</h3>
      <p className="text-sm text-muted-foreground">
        Obtenez une proposition de ce cabinet ou comparez plusieurs experts-comptables avant de choisir.
      </p>
      <Link
        href="/demander-un-devis"
        className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'w-full justify-center')}
      >
        Demander un devis gratuit
      </Link>
    </div>
  )
}
