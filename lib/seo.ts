import type { CabinetWithRelations, City } from '@/lib/types'
import { resolveSiteOrigin } from '@/lib/site-config'

export const SITE_NAME = 'Cabinets Comptables FR'

// ─── Base URL ─────────────────────────────────────────────────────
// Every canonical, og:url, JSON-LD @id and sitemap <loc> is built from this.
// The origin itself lives in lib/site-config.ts, which explains why it is a
// constant and not a dashboard setting.

let _siteUrl: string | undefined

export function siteUrl(): string {
  if (_siteUrl === undefined) _siteUrl = resolveSiteOrigin()
  return _siteUrl
}

export function canonicalUrl(path: string): string {
  const base = siteUrl()
  const suffix = path.startsWith('/') ? path : `/${path}`
  // The homepage canonical has to be `https://host/`, not the bare origin.
  return `${base}${suffix}`
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
  // No SITE_NAME here: the root layout's title template already appends
  // ` | ${SITE_NAME}`. Adding it here printed the site name twice in the SERP.
  return `${p.cabinetName} — Expert-comptable à ${ville} (${cp})`
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

export function buildArrDescription(p: {
  city: Pick<City, 'key' | 'name' | 'zip'>
  count: number
}): string {
  const ville = formatCityDisplay(p.city)
  return truncate(
    `Annuaire des ${p.count} cabinet${p.count > 1 ? 's' : ''} comptable${p.count > 1 ? 's' : ''} à ${ville} (${p.city.zip}). Comparez les experts-comptables : avis, horaires, spécialités, contacts.`,
  )
}

export function buildDeptTitle(p: { dptName: string; dptCode: string; count: number }): string {
  return `Cabinets comptables ${p.dptName} (${p.dptCode}) : ${p.count} experts-comptables — Annuaire ${YEAR}`
}

export function buildRegionTitle(p: { regionName: string; count: number }): string {
  return `Cabinets comptables en ${p.regionName} : ${p.count} experts-comptables — Annuaire ${YEAR}`
}

export function buildHomepageTitle(): string {
  // Kept under ~60 characters so Google shows it whole.
  return `Annuaire des cabinets comptables et experts-comptables`
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
    '@id': canonical,
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
    isPartOf: { '@type': 'WebSite', '@id': `${siteUrl()}/#website` },
  }

  if (cabinet.phoneE164) base.telephone = cabinet.phoneE164
  if (cabinet.imageMainPath) base.image = canonicalUrl(cabinet.imageMainPath)
  if (cabinet.imageLogoPath) base.logo = canonicalUrl(cabinet.imageLogoPath)

  if (cabinet.siren) {
    base.identifier = `SIREN:${cabinet.siren}`
    if (cabinet.formeJuridiqueLabel) base.legalName = cabinet.formeJuridiqueLabel
    if (cabinet.dateCreation) base.foundingDate = cabinet.dateCreation
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
  cabinets: Array<{ title: string; cityKey: string; slug: string }>
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
    '@id': `${base}/#website`,
    name: SITE_NAME,
    url: `${base}/`,
    inLanguage: 'fr-FR',
    description:
      "Annuaire indépendant des cabinets d'expertise comptable en France, classés par ville, département, région et spécialité.",
    publisher: { '@id': `${base}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${base}/recherche?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

// Homepage FAQ. Mirrors the visible <details> block in app/page.tsx — Google
// requires the marked-up answers to be present on the page itself.
export const HOMEPAGE_FAQ: { question: string; answer: string }[] = [
  {
    question: "Comment choisir un cabinet d'expertise comptable ?",
    answer:
      "Regardez trois choses avant le tarif : la proximité (un rendez-vous physique reste utile pour un bilan), la spécialisation sectorielle (un cabinet habitué au BTP ou à l'e-commerce connaît déjà vos écritures courantes) et la taille du cabinet rapportée à la vôtre. Vérifiez systématiquement que le professionnel est inscrit au tableau de l'Ordre des experts-comptables : seule cette inscription autorise la tenue de comptabilité pour le compte de tiers.",
  },
  {
    question: "Quel est le tarif d'un expert-comptable ?",
    answer:
      "Les honoraires sont libres et dépendent du volume d'écritures, du régime fiscal et des missions confiées. En ordre de grandeur, une micro-entreprise ou une SCI simple se situe le plus souvent entre 60 et 150 € HT par mois, une TPE avec TVA et paie entre 150 et 400 € HT par mois. Demandez toujours une lettre de mission détaillant précisément le périmètre : c'est elle qui évite les suppléments en fin d'exercice.",
  },
  {
    question: "Expert-comptable en ligne ou cabinet local ?",
    answer:
      "Un cabinet en ligne est généralement moins cher et suffit pour une activité simple et dématérialisée. Un cabinet local prend l'avantage dès qu'il y a des salariés, des sujets fiscaux ou juridiques particuliers, une transmission, ou simplement un besoin de conseil récurrent. Beaucoup de cabinets référencés ici proposent aujourd'hui les deux : outils en ligne et rendez-vous sur place.",
  },
  {
    question: "Comment sont constituées les fiches de cet annuaire ?",
    answer:
      "Chaque fiche regroupe des données publiques : coordonnées et horaires issus des fiches d'établissement publiques, informations légales (SIREN, forme juridique, date de création, tranche d'effectif) issues de la base SIRENE de l'INSEE. Nous ne vendons pas de positionnement et nous ne sommes affiliés à aucun cabinet. Un cabinet peut demander la correction ou la suppression de sa fiche à tout moment.",
  },
  {
    question: "L'annuaire est-il gratuit ?",
    answer:
      "Oui. La consultation des fiches et la demande de devis sont gratuites et sans engagement pour les entreprises comme pour les particuliers.",
  },
]

export function buildFaqJsonLd(
  items: { question: string; answer: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

export function buildSpecialiteTitle(label: string, count: number): string {
  return `Expert-comptable spécialisé ${label} en France : ${count} cabinets — Annuaire ${YEAR}`
}

export function buildSpecialiteDescription(label: string, count: number): string {
  const n = count >= 50 ? '50+' : String(count)
  return truncate(
    `Trouvez un expert-comptable spécialisé ${label}. ${n} cabinet${count > 1 ? 's' : ''} référencé${count > 1 ? 's' : ''} en France. Comparez avis, horaires et contacts.`,
  )
}

export function buildOrganizationJsonLd(): Record<string, unknown> {
  const base = siteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${base}/#organization`,
    name: SITE_NAME,
    url: `${base}/`,
    logo: canonicalUrl('/icon.svg'),
    description:
      "Annuaire indépendant des cabinets d'expertise comptable en France. Données issues de sources publiques (fiches d'établissement, base SIRENE de l'INSEE).",
    areaServed: { '@type': 'Country', name: 'France' },
  }
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
