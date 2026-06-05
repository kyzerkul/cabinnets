// Phase 1 scaffold — static text only. Phase 2: links to /claim (Clerk auth + Stripe).
export function ClaimCta({ cabinetName }: { cabinetName: string }) {
  return (
    <p className="text-xs text-center text-muted-foreground px-2">
      Vous gérez <span className="font-medium">{cabinetName}</span> ?{' '}
      <span className="text-foreground/50">Revendiquer cette fiche — bientôt disponible.</span>
    </p>
  )
}
