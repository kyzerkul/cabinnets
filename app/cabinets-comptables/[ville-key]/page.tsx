import { notFound } from 'next/navigation'
import { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getAllNormalCityKeys,
  getAllThinCityKeys,
  getAllParisArrKeys,
  getCity,
  getCitiesByDeptWithCount,
  getNearbyNormalCities,
  getParisArrondissementsWithCount,
} from '@/lib/cities'
import { getCabinetsByCity, countCabinetsByDept, getCabinetsNearCityFast } from '@/lib/cabinets'
import {
  buildArrTitle,
  buildArrDescription,
  buildVilleTitle,
  buildVilleDescription,
  buildVilleThinTitle,
  buildVilleThinDescription,
  buildCollectionPageJsonLd,
  buildBreadcrumbsJsonLd,
  canonicalUrl,
  formatCityDisplay,
  formatZipShort,
} from '@/lib/seo'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SiteBreadcrumb } from '@/components/layout/breadcrumb'
import { JsonLd } from '@/components/seo/json-ld'
import { ArrondissementsGrid } from '@/components/listing/arrondissements-grid'
import { ListingHeader } from '@/components/listing/listing-header'
import { ThinListingHeader } from '@/components/listing/thin-listing-header'
import { CabinetGrid } from '@/components/listing/cabinet-grid'
import { ListingFilters } from '@/components/listing/listing-filters'
import { VillesDuDept } from '@/components/listing/villes-du-dept'
import { VillesVoisines } from '@/components/listing/villes-voisines'

type Props = {
  params: Promise<{ 'ville-key': string }>
}

const loadPageData = cache(async (cityKey: string) => {
  const city = await getCity(cityKey)
  if (!city) return null
  const [cabinets, citiesDept, nearbyCities, deptCount] = await Promise.all([
    getCabinetsByCity(cityKey),
    getCitiesByDeptWithCount(city.dptCode),
    getNearbyNormalCities(cityKey, 5),
    countCabinetsByDept(city.dptCode),
  ])
  return { city, cabinets, citiesDept, nearbyCities, deptCount }
})

// Deduplicated between generateMetadata and page() via React.cache
const loadNearbyCabinets = cache((cityKey: string) => getCabinetsNearCityFast(cityKey, 20))

export async function generateStaticParams() {
  const [normalKeys, thinKeys, arrKeys] = await Promise.all([
    getAllNormalCityKeys(),
    getAllThinCityKeys(),
    getAllParisArrKeys(),
  ])
  return [...normalKeys, ...thinKeys, ...arrKeys].map((k) => ({ 'ville-key': k }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cityKey = (await params)['ville-key']
  const data = await loadPageData(cityKey)
  if (!data) return {}
  const { city, cabinets } = data
  const canonical = canonicalUrl(`/cabinets-comptables/${cityKey}`)

  // ── Paris arrondissement ──────────────────────────────────────────
  if (cityKey.startsWith('paris-750')) {
    const count = cabinets.length
    const title = buildArrTitle({ city, count })
    const description = buildArrDescription({ city, count })
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { title, description, url: canonical },
    }
  }

  // ── Normal (≥3 cabinets) ──────────────────────────────────────────
  if (cabinets.length >= 3) {
    const count = cabinets.length
    const title = buildVilleTitle({ city, dptCode: city.dptCode, count })
    const description = buildVilleDescription({ city, count })
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { title, description, url: canonical },
    }
  }

  // ── Thin (<3 cabinets) ────────────────────────────────────────────
  const nearbyCabinets = await loadNearbyCabinets(cityKey)
  const title = buildVilleThinTitle({ city, dptCode: city.dptCode })
  const description = buildVilleThinDescription({
    city,
    localCount: cabinets.length,
    nearbyCount: nearbyCabinets.length,
  })
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  }
}

export default async function VillePage({ params }: Props) {
  const cityKey = (await params)['ville-key']

  const data = await loadPageData(cityKey)
  if (!data) notFound()
  const { city, cabinets, citiesDept, nearbyCities, deptCount } = data

  const dept = city.department
  const region = dept.region
  const cityDisplay = formatCityDisplay(city)
  const zipShort = formatZipShort(city, city.dptCode)

  // ── Paris arrondissement ──────────────────────────────────────
  if (cityKey.startsWith('paris-750')) {
    if (cabinets.length === 0) notFound()

    const arrondissements = await getParisArrondissementsWithCount()
    const count = cabinets.length
    const pageUrl = canonicalUrl(`/cabinets-comptables/${cityKey}`)
    const arrDescription = buildArrDescription({ city, count })

    const breadcrumbEntries = [
      { name: 'Accueil', url: canonicalUrl('/') },
      { name: region.name, url: canonicalUrl(`/cabinets-comptables/region/${region.slug}`) },
      {
        name: `${dept.name} (${dept.code})`,
        url: canonicalUrl(`/cabinets-comptables/departement/${dept.slug}`),
      },
      { name: `Cabinets comptables à ${cityDisplay}` },
    ]
    const breadcrumbItems = [
      { label: 'Accueil', href: '/' },
      { label: region.name, href: `/cabinets-comptables/region/${region.slug}` },
      { label: `${dept.name} (${dept.code})`, href: `/cabinets-comptables/departement/${dept.slug}` },
      { label: `Cabinets comptables à ${cityDisplay}` },
    ]

    return (
      <>
        <JsonLd
          data={buildCollectionPageJsonLd({
            url: pageUrl,
            name: buildArrTitle({ city, count }),
            description: arrDescription,
            cabinets: cabinets.slice(0, 10),
          })}
        />
        <JsonLd data={buildBreadcrumbsJsonLd(breadcrumbEntries)} />

        <SiteBreadcrumb items={breadcrumbItems} />

        <Section className="border-b bg-secondary/30">
          <Container size="wide">
            <ListingHeader
              cityDisplay={cityDisplay}
              zipShort={zipShort}
              count={count}
              description={arrDescription}
            />
          </Container>
        </Section>

        <Section>
          <Container size="wide">
            <ListingFilters cabinets={cabinets} />
          </Container>
        </Section>

        <Section className="border-t bg-secondary/20">
          <Container size="wide">
            <h2 className="text-xl font-semibold mb-6">Les 20 arrondissements de Paris</h2>
            <ArrondissementsGrid arrondissements={arrondissements} currentKey={cityKey} />
            <div className="flex flex-wrap gap-3 pt-6 mt-6 border-t">
              <Link
                href={`/cabinets-comptables/departement/${dept.slug}`}
                className="text-sm hover:underline text-muted-foreground"
              >
                ← Voir les cabinets dans le {dept.name} ({dept.code})
              </Link>
              <Link
                href={`/cabinets-comptables/region/${region.slug}`}
                className="text-sm hover:underline text-muted-foreground"
              >
                ← Cabinets comptables en {region.name}
              </Link>
            </div>
          </Container>
        </Section>
      </>
    )
  }

  // ── Thin template (< 3 cabinets) ──────────────────────────────
  if (cabinets.length < 3) {
    const nearbyCabinets = await loadNearbyCabinets(cityKey)

    if (cabinets.length === 0 && nearbyCabinets.length === 0) notFound()

    const pageUrl = canonicalUrl(`/cabinets-comptables/${cityKey}`)
    const thinTitle = buildVilleThinTitle({ city, dptCode: city.dptCode })
    const thinDescription = buildVilleThinDescription({
      city,
      localCount: cabinets.length,
      nearbyCount: nearbyCabinets.length,
    })

    const breadcrumbEntries = [
      { name: 'Accueil', url: canonicalUrl('/') },
      { name: region.name, url: canonicalUrl(`/cabinets-comptables/region/${region.slug}`) },
      { name: dept.name, url: canonicalUrl(`/cabinets-comptables/departement/${dept.slug}`) },
      { name: `Cabinets comptables à ${cityDisplay}` },
    ]
    const breadcrumbItems = [
      { label: 'Accueil', href: '/' },
      { label: region.name, href: `/cabinets-comptables/region/${region.slug}` },
      { label: dept.name, href: `/cabinets-comptables/departement/${dept.slug}` },
      { label: `Cabinets comptables à ${cityDisplay}` },
    ]

    return (
      <>
        <JsonLd
          data={buildCollectionPageJsonLd({
            url: pageUrl,
            name: thinTitle,
            description: thinDescription,
            cabinets: [...cabinets, ...nearbyCabinets].slice(0, 10),
          })}
        />
        <JsonLd data={buildBreadcrumbsJsonLd(breadcrumbEntries)} />

        <SiteBreadcrumb items={breadcrumbItems} />

        <Section className="border-b bg-secondary/30">
          <Container size="wide">
            <ThinListingHeader
              cityDisplay={cityDisplay}
              zipShort={zipShort}
              localCount={cabinets.length}
              nearbyCount={nearbyCabinets.length}
            />
          </Container>
        </Section>

        {cabinets.length > 0 && (
          <Section>
            <Container size="wide">
              <h2 className="text-xl font-semibold mb-4">
                {cabinets.length === 1 ? '1 cabinet' : `${cabinets.length} cabinets`} à{' '}
                {cityDisplay}
              </h2>
              <CabinetGrid cabinets={cabinets} />
            </Container>
          </Section>
        )}

        {nearbyCabinets.length > 0 && (
          <Section>
            <Container size="wide">
              <h2 className="text-xl font-semibold mb-4">
                Cabinets comptables à proximité (rayon 20 km)
              </h2>
              <CabinetGrid cabinets={nearbyCabinets} />
            </Container>
          </Section>
        )}

        <Section className="border-t bg-secondary/20">
          <Container size="wide">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <VillesDuDept cities={citiesDept} currentKey={cityKey} deptName={dept.name} />
              <VillesVoisines cities={nearbyCities} />
            </div>
            <div className="flex flex-wrap gap-3 pt-6 border-t">
              <Link
                href={`/cabinets-comptables/departement/${dept.slug}`}
                className="text-sm hover:underline text-muted-foreground"
              >
                ← Voir les {deptCount} cabinets du {dept.name}
              </Link>
              <Link
                href={`/cabinets-comptables/region/${region.slug}`}
                className="text-sm hover:underline text-muted-foreground"
              >
                ← Cabinets comptables en {region.name}
              </Link>
            </div>
          </Container>
        </Section>
      </>
    )
  }

  // ── Normal template (≥ 3 cabinets) ────────────────────────────
  const count = cabinets.length
  const canonical = canonicalUrl(`/cabinets-comptables/${cityKey}`)

  const collectionPageJsonLd = buildCollectionPageJsonLd({
    url: canonical,
    name: buildVilleTitle({ city, dptCode: city.dptCode, count }),
    description: buildVilleDescription({ city, count }),
    cabinets,
  })

  const breadcrumbJsonLd = buildBreadcrumbsJsonLd([
    { name: 'Accueil', url: canonicalUrl('/') },
    { name: region.name, url: canonicalUrl(`/cabinets-comptables/region/${region.slug}`) },
    { name: dept.name, url: canonicalUrl(`/cabinets-comptables/departement/${dept.slug}`) },
    { name: `Cabinets comptables à ${cityDisplay}` },
  ])

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: region.name, href: `/cabinets-comptables/region/${region.slug}` },
    { label: dept.name, href: `/cabinets-comptables/departement/${dept.slug}` },
    { label: `Cabinets comptables à ${cityDisplay}` },
  ]

  return (
    <>
      <JsonLd data={collectionPageJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <SiteBreadcrumb items={breadcrumbItems} />

      <Section className="border-b bg-secondary/30">
        <Container size="wide">
          <ListingHeader
            cityDisplay={cityDisplay}
            zipShort={zipShort}
            count={count}
            description={buildVilleDescription({ city, count })}
          />
        </Container>
      </Section>

      <Section>
        <Container size="wide">
          <ListingFilters cabinets={cabinets} />
        </Container>
      </Section>

      <Section className="border-t bg-secondary/20">
        <Container size="wide">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <VillesDuDept cities={citiesDept} currentKey={cityKey} deptName={dept.name} />
            <VillesVoisines cities={nearbyCities} />
          </div>

          <div className="flex flex-wrap gap-3 pt-6 border-t">
            <Link
              href={`/cabinets-comptables/departement/${dept.slug}`}
              className="text-sm hover:underline text-muted-foreground"
            >
              ← Voir les {deptCount} cabinets du {dept.name}
            </Link>
            <Link
              href={`/cabinets-comptables/region/${region.slug}`}
              className="text-sm hover:underline text-muted-foreground"
            >
              ← Cabinets comptables en {region.name}
            </Link>
          </div>
        </Container>
      </Section>
    </>
  )
}
