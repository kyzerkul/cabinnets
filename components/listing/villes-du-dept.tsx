import Link from 'next/link'

interface VillesDuDeptProps {
  cities: { key: string; name: string; zip: string; cabinetCount: number }[]
  currentKey: string
  deptName: string
}

export function VillesDuDept({ cities, currentKey, deptName }: VillesDuDeptProps) {
  const filtered = cities
    .filter((c) => c.key !== currentKey && c.cabinetCount > 0)
    .sort((a, b) => b.cabinetCount - a.cabinetCount || a.name.localeCompare(b.name, 'fr'))
    .slice(0, 20)

  if (filtered.length === 0) return null

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Autres villes — {deptName}</h2>
      <ul className="space-y-1">
        {filtered.map((city) => (
          <li key={city.key} className="flex items-center justify-between gap-2">
            <Link
              href={`/cabinets-comptables/${city.key}`}
              className="text-sm hover:underline text-foreground"
            >
              Cabinets comptables à {city.name}
            </Link>
            <span className="text-xs text-muted-foreground shrink-0">
              {city.cabinetCount} cab.
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
