import type { CabinetWithCity, CabinetWithRelations, City } from '@/lib/types'

export const SITE_NAME = 'Cabinets Comptables FR'

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')
}

export function canonicalUrl(path: string): string {
  const base = siteUrl()
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

// "Paris 16e" for arr keys (paris-75016), city.name for everything else.
export function formatCityDisplay(city: Pick<City, 'key' | 'name' | 'zip'>): string {
  const m = city.key.match(/^paris-750(\d{2})$/)
  if (m) {
    const n = parseInt(m[1], 10)
    return `Paris ${n === 1 ? '1er' : `${n}e`}`
  }
  return city.name
}

// Paris arr → full zip ("75016"); others → dept code ("69").
export function formatZipShort(city: Pick<City, 'key' | 'zip'>, dptCode: string): string {
  if (city.key.startsWith('paris-750') && city.key !== 'paris-75') return city.zip
  return dptCode
}

function truncate(s: string, max = 160): string {
  return s.length <= max ? s : s.slice(0, max - 1) + '…'
}

const YEAR = new Date().getFullYear()

// ─── Title builders ───────────────────────────────────────────────

export function buildFicheTitle(p: {
  cabinetName: string
  city: Pick<City, 'key' | 'name' | 'zip'>
  dptCode: string
}): string {
  const ville = formatCityDisplay(p.city)
  const cp = formatZipShort(p.city, p.dptCode)
  return `${p.cabinetName} — Expert-comptable à ${ville} (${cp}) | ${SITE_NAME}`
}

export function buildVilleTitle(p: {
  city: Pick<City, 'key' | 'name' | 'zip'>
  dptCode: string
  count: number
}): string {
  const ville = formatCityDisplay(p.city)
  const cp = formatZipShort(p.city, p.dptCode)
  return `Cabinets comptables à ${ville} (${cp}) : ${p.count} experts-comptables — Annuaire ${YEAR}`
}

export function buildVilleThinTitle(p: {
  city: Pick<City, 'key' | 'name' | 'zip'>
  dptCode: string
}): string {
  const ville = formatCityDisplay(p.city)
  const cp = formatZipShort(p.city, p.dptCode)
  return `Cabinets comptables à ${ville} (${cp}) et environs — Annuaire ${YEAR}`
}

// For arrondissement pages (city.key = "paris-75016" etc.)
export function buildArrTitle(p: {
  city: Pick<City, 'key' | 'name' | 'zip'>
  count: number
}): string {
  const ville = formatCityDisplay(p.city)
  return `Cabinets comptables à ${ville} (${p.city.zip}) : ${p.count} experts-comptables — Annuaire ${YEAR}`
}

export function buildDeptTitle(p: { dptName: string; dptCode: string; count: number }): string {
  return `Cabinets comptables ${p.dptName} (${p.dptCode}) : ${p.count} experts-comptables — Annuaire ${YEAR}`
}

export function buildRegionTitle(p: { regionName: string; count: number }): string {
  return `Cabinets comptables en ${p.regionName} : ${p.count} experts-comptables — Annuaire ${YEAR}`
}

export function buildHomepageTitle(): string {
  return `Annuaire des cabinets comptables en France — Trouvez votre expert-comptable`
}

// ─── Description builders ─────────────────────────────────────────

export function buildFicheDescription(p: {
  cabinetName: string
  city: Pick<City, 'key' | 'name' | 'zip'>
  dptCode: string
  rating?: number | null
  ratingCount?: number | null
  phone?: string | null
  description?: string | null
}): string {
  const ville = formatCityDisplay(p.city)
  const cp = formatZipShort(p.city, p.dptCode)
  const rating =
    p.rating && p.ratingCount ? `${p.rating.toFixed(1)}/5 (${p.ratingCount} avis). ` : ''
  const phone = p.phone ? `${p.phone}. ` : ''
  const tail = p.description
    ? p.description.split('.')[0] + '.'
    : 'Découvrez les coordonnées, horaires et services.'
  return truncate(`${p.cabinetName}, expert-comptable à ${ville} (${cp}). ${rating}${phone}${tail}`)
}

export function buildVilleDescription(p: {
  city: Pick<City, 'key' | 'name' | 'zip'>
  count: number
}): string {
  const ville = formatCityDisplay(p.city)
  return truncate(
    `Annuaire des ${p.count} cabinets comptables à ${ville}. Comparez les experts-comptables : avis, horaires, spécialités, contacts.`,
  )
}

export function buildVilleThinDescription(p: {
  city: Pick<City, 'key' | 'name' | 'zip'>
  localCount: number
  nearbyCount: number
}): string {
  const ville = formatCityDisplay(p.city)
  return truncate(
    `${p.localCount} cabinet(s) comptable(s) à ${ville} + ${p.nearbyCount} dans les villes voisines (rayon 20km). Comparez avant de choisir.`,
  )
}

export function buildDeptDescription(p: {
  dptName: string
  dptCode: string
  count: number
}): string {
  return truncate(
    `Trouvez un cabinet comptable dans le ${p.dptName} (${p.dptCode}). ${p.count} experts-comptables référencés. Comparez avis, services et tarifs.`,
  )
}

export function buildRegionDescription(p: { regionName: string; count: number }): string {
  return truncate(
    `Annuaire des ${p.count} cabinets comptables en ${p.regionName}. Comparez les experts-comptables : avis, spécialités, contacts.`,
  )
}

export function buildHomepageDescription(p: { total: number; dptCount: number }): string {
  return truncate(
    `Annuaire de ${p.total} cabinets comptables en France. Trouvez un expert-comptable près de chez vous : avis, horaires, contacts. ${p.dptCount} départements couverts.`,
  )
}

// ─── JSON-LD builders ─────────────────────────────────────────────

export function buildFicheJsonLd(cabinet: CabinetWithRelations): Record<string, unknown> {
  const ville = formatCityDisplay(cabinet.city)
  const canonical = canonicalUrl(`/expert-comptable/${cabinet.cityKey}/${cabinet.slug}`)

  const base: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'AccountingService',
    name: cabinet.title,
    description: cabinet.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: cabinet.street,
      addressLocality: ville,
      postalCode: cabinet.zip,
      addressRegion: cabinet.city.department.region.name,
      addressCountry: 'FR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: cabinet.latitude,
      longitude: cabinet.longitude,
    },
    url: cabinet.url ?? canonical,
    areaServed: ville,
    priceRange: '€€',
  }

  if (cabinet.phoneE164) base.telephone = cabinet.phoneE164
  if (cabinet.imageMainPath) base.image = canonicalUrl(cabinet.imageMainPath)
  if (cabinet.imageLogoPath) base.logo = canonicalUrl(cabinet.imageLogoPath)

  if (cabinet.siren) {
    base.identifier = `SIREN:${cabinet.siren}`
    if (cabinet.formeJuridiqueLabel) base.legalName = cabinet.formeJuridiqueLabel
    if (cabinet.dateCreation) base.foundingDate = cabinet.dateCreation
  }

  if (cabinet.ratingValue && cabinet.ratingCount && cabinet.ratingCount > 0) {
    base.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: cabinet.ratingValue,
      reviewCount: cabinet.ratingCount,
      bestRating: 5,
      worstRating: 1,
    }
  }

  if (cabinet.services.length > 0) base.knowsAbout = cabinet.services

  const openingHours = buildOpeningHoursSpec(cabinet.workHours)
  if (openingHours.length > 0) base.openingHoursSpecification = openingHours

  return base
}

export function buildCollectionPageJsonLd(p: {
  url: string
  name: string
  description: string
  cabinets: CabinetWithCity[]
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: p.name,
    description: p.description,
    url: p.url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: p.cabinets.slice(0, 10).map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.title,
        url: canonicalUrl(`/expert-comptable/${c.cityKey}/${c.slug}`),
      })),
    },
  }
}

export function buildBreadcrumbsJsonLd(
  items: { name: string; url?: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  }
}

export function buildWebsiteJsonLd(): Record<string, unknown> {
  const base = siteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: base,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${base}/recherche?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildOrganizationJsonLd(): Record<string, unknown> {
  const base = siteUrl()
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
  }
  if (base) {
    jsonLd.url = base
    jsonLd.logo = canonicalUrl('/icon.svg')
  }
  return jsonLd
}

// ─── Internal ─────────────────────────────────────────────────────

function buildOpeningHoursSpec(workHours: unknown): Record<string, unknown>[] {
  if (!workHours || typeof workHours !== 'object' || Array.isArray(workHours)) return []
  const DAY_MAP: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  }
  const result: Record<string, unknown>[] = []
  for (const [day, slots] of Object.entries(workHours as Record<string, unknown>)) {
    const schemaDay = DAY_MAP[day]
    if (!schemaDay || !Array.isArray(slots)) continue
    for (const slot of slots) {
      if (slot !== null && typeof slot === 'object' && 'open' in slot && 'close' in slot) {
        result.push({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: `https://schema.org/${schemaDay}`,
          opens: (slot as { open: string }).open,
          closes: (slot as { close: string }).close,
        })
      }
    }
  }
  return result
}
