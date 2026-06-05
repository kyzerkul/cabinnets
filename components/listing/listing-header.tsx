interface ListingHeaderProps {
  cityDisplay: string
  zipShort: string
  count: number
  description: string
}

export function ListingHeader({ cityDisplay, zipShort, count, description }: ListingHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
        Cabinets comptables à {cityDisplay}{' '}
        <span className="text-muted-foreground font-normal text-2xl md:text-3xl">({zipShort})</span>
      </h1>
      <p className="mt-3 text-muted-foreground">
        <span className="font-medium text-foreground">
          {count} expert{count > 1 ? 's' : ''}-comptable{count > 1 ? 's' : ''}
        </span>{' '}
        référencé{count > 1 ? 's' : ''} dans l&apos;annuaire
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
