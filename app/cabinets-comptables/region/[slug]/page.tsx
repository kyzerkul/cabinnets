import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getAllRegions,
  getRegionBySlug,
  getDeptsByRegion,
  getTopCitiesByRegion,
} from '@/lib/cities'
import { getCabinetsByRegion, countCabinetsByRegion, countCabinetsByDept } from '@/lib/cabinets'
import {
  buildRegionTitle,
  buildRegionDescription,
  buildCollectionPageJsonLd,
  buildBreadcrumbsJsonLd,
  canonicalUrl,
} from '@/lib/seo'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Badge } from '@/components/ui/badge'
import { SiteBreadcrumb } from '@/components/layout/breadcrumb'
import { RegionDeptsGrid } from '@/components/listing/region-depts-grid'
import { ExpandableCabinetGrid } from '@/components/listing/expandable-cabinet-grid'
import { JsonLd } from '@/components/seo/json-ld'

export const dynamicParams = false

export async function generateStaticParams() {
  const regions = await getAllRegions()
  return regions.map((r) => ({ slug: r.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const region = await getRegionBySlug(slug)
  if (!region) return {}
  const count = await countCabinetsByRegion(region.code)
  const title = buildRegionTitle({ regionName: region.name, count })
  const description = buildRegionDescription({ regionName: region.name, count })
  const canonical = canonicalUrl(`/cabinets-comptables/region/${region.slug}`)
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, locale: 'fr_FR', type: 'website' },
  }
}

export default async function RegionPage({ params }: Props) {
  const { slug } = await params
  const region = await getRegionBySlug(slug)
  if (!region) notFound()

  const [cabinets, depts, topCities, allRegions] = await Promise.all([
    getCabinetsByRegion(region.code),
    getDeptsByRegion(region.code),
    getTopCitiesByRegion(region.code, 12),
    getAllRegions(),
  ])
  const totalCount = cabinets.length

  const deptsWithCount = await Promise.all(
    depts.map(async (d) => ({ ...d, cabinetCount: await countCabinetsByDept(d.code) })),
  )

  const otherRegions = allRegions.filter((r) => r.code !== region.code)
  const pageUrl = canonicalUrl(`/cabinets-comptables/region/${region.slug}`)
  const breadcrumbs = [
    { name: 'Accueil', url: canonicalUrl('/') },
    { name: `Cabinets comptables en ${region.name}` },
  ]

  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          url: pageUrl,
          name: buildRegionTitle({ regionName: region.name, count: totalCount }),
          description: buildRegionDescription({ regionName: region.name, count: totalCount }),
          cabinets: cabinets.slice(0, 10).map((c) => ({
            title: c.title,
            cityKey: c.cityKey,
            slug: c.slug,
          })),
        })}
      />
      <JsonLd data={buildBreadcrumbsJsonLd(breadcrumbs)} />

      <Container size="wide">
        <SiteBreadcrumb items={breadcrumbs.map((b) => ({ label: b.name, href: b.url }))} />

        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Cabinets comptables en {region.name}
          </h1>
          <p className="mt-2 text-muted-foreground">
            <Badge variant="secondary" className="mr-2">
              {totalCount} expert{totalCount > 1 ? 's' : ''}-comptable
              {totalCount > 1 ? 's' : ''} référencés
            </Badge>
          </p>
        </div>

        <Section>
          <h2 className="text-xl font-semibold mb-6">
            Cabinets les mieux notés en {region.name}
          </h2>
          <ExpandableCabinetGrid cabinets={cabinets} initialCount={12} />
        </Section>

        <Section>
          <h2 className="text-xl font-semibold mb-6">
            Départements de la région {region.name}
          </h2>
          <RegionDeptsGrid depts={deptsWithCount} />
        </Section>

        {topCities.length > 0 && (
          <Section>
            <h2 className="text-xl font-semibold mb-4">Principales villes en {region.name}</h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {topCities.map((city) => (
                <li key={city.key}>
                  <Link
                    href={`/cabinets-comptables/${city.key}`}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary transition-colors"
                  >
                    <span className="font-medium truncate">{city.name}</span>
                    <Badge variant="secondary" className="ml-2 shrink-0 text-xs tabular-nums">
                      {city.cabinetCount}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {otherRegions.length > 0 && (
          <Section>
            <h2 className="text-xl font-semibold mb-4">Autres régions</h2>
            <div className="flex flex-wrap gap-2">
              {otherRegions.map((r) => (
                <Link
                  key={r.code}
                  href={`/cabinets-comptables/region/${r.slug}`}
                  className="text-sm border border-border rounded-md px-3 py-1.5 hover:bg-secondary transition-colors"
                >
                  {r.name}
                </Link>
              ))}
            </div>
          </Section>
        )}
      </Container>
    </>
  )
}
