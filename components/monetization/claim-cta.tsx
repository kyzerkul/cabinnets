import Link from 'next/link'

export function ClaimCta({ cabinetName }: { cabinetName: string }) {
  return (
    <div className="rounded-md border p-4 text-sm">
      <p className="font-medium text-foreground">Vous êtes cet expert-comptable ?</p>
      <p className="mt-1 text-muted-foreground">
        Revendiquez la fiche <span className="font-medium">{cabinetName}</span> pour mettre vos
        informations à jour.
      </p>
      <Link
        href="/revendiquer-ma-fiche"
        className="mt-2 inline-block text-primary underline-offset-4 hover:underline"
      >
        Revendiquer cette fiche →
      </Link>
    </div>
  )
}
