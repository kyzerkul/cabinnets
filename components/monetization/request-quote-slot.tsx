import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Phase 1 scaffold — link only. Phase 2: wires to Server Action writing Lead to Postgres + email.
export function RequestQuoteSlot() {
  return (
    <div className="rounded-lg border bg-secondary/40 p-5 text-center space-y-3">
      <p className="text-sm font-semibold">Demander un devis gratuit</p>
      <p className="text-xs text-muted-foreground">
        Comparez plusieurs experts-comptables avant de choisir.
      </p>
      <Link
        href="/demander-un-devis"
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full justify-center')}
      >
        Demander un devis
      </Link>
    </div>
  )
}
