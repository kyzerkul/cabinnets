import { notFound } from 'next/navigation'
import { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getAllNormalCityKeys,
  getCity,
  getCitiesByDeptWithCount,
  getNearbyNormalCities,
} from '@/lib/cities'
import { getCabinetsByCity, countCabinetsByDept } from '@/lib/cabinets'
import {
  buildVilleTitle,
  buildVilleDescription,
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
import { ListingHeader } from '@/components/listing/listing-header'
import { CabinetGrid } from '@/components/listing/cabinet-grid'
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

export async function generateStaticParams() {
  const keys = await getAllNormalCityKeys()
  return keys.map((k) => ({ 'ville-key': k }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cityKey = (await params)['ville-key']
  const data = await loadPageData(cityKey)
  if (!data) return {}
  const { city, cabinets } = data
  const count = cabinets.length
  const title = buildVilleTitle({ city, dptCode: city.dptCode, count })
  const description = buildVilleDescription({ city, count })
  const canonical = canonicalUrl(`/cabinets-comptables/${cityKey}`)
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  }
}

export default async function VillePage({ params }: Props) {
  const cityKey = (await params)['ville-key']

  // Paris arrondissements are handled in spec 12b
  if (cityKey.startsWith('paris-750') && cityKey !== 'paris-75') notFound()

  const data = await loadPageData(cityKey)
  if (!data) notFound()
  const { city, cabinets, citiesDept, nearbyCities, deptCount } = data

  // Thin cities (<3 cabinets) are handled in spec 10
  if (cabinets.length < 3) notFound()

  const dept = city.department
  const region = dept.region
  const cityDisplay = formatCityDisplay(city)
  const zipShort = formatZipShort(city, city.dptCode)
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
          <CabinetGrid cabinets={cabinets} />
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
