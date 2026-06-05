import type { Metadata } from 'next'
import { cache } from 'react'
import Link from 'next/link'
import { getTotalCabinetCount } from '@/lib/cabinets'
import { getDeptCount, getCityCount, getTopCitiesByCabinetCount } from '@/lib/cities'
import {
  buildHomepageTitle,
  buildHomepageDescription,
  buildWebsiteJsonLd,
  buildOrganizationJsonLd,
  canonicalUrl,
  formatCityDisplay,
} from '@/lib/seo'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { HomepageSearch } from '@/components/homepage-search'

const loadData = cache(async () => {
  const [total, deptCount, cityCount, topCities] = await Promise.all([
    getTotalCabinetCount(),
    getDeptCount(),
    getCityCount(),
    getTopCitiesByCabinetCount(24),
  ])
  return { total, deptCount, cityCount, topCities }
})

export async function generateMetadata(): Promise<Metadata> {
  const { total, deptCount } = await loadData()
  const title = buildHomepageTitle()
  const description = buildHomepageDescription({ total, dptCount: deptCount })
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: canonicalUrl('/') },
    openGraph: { title, description, url: canonicalUrl('/') },
  }
}

export default async function HomePage() {
  const { total, deptCount, cityCount, topCities } = await loadData()
  const description = buildHomepageDescription({ total, dptCount: deptCount })

  const websiteJsonLd = buildWebsiteJsonLd()
  const orgJsonLd = buildOrganizationJsonLd()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      {/* ── Hero ── */}
      <Section className="bg-secondary">
        <Container size="narrow" className="text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Trouvez votre expert-comptable en France
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-prose mx-auto">{description}</p>
          <HomepageSearch />
        </Container>
      </Section>

      {/* ── Chiffres clés ── */}
      <div className="border-y bg-card">
        <Container>
          <div className="grid grid-cols-3 divide-x py-6 text-center">
            <div className="px-4">
              <p className="text-3xl font-semibold tabular-nums">
                {total.toLocaleString('fr-FR')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">cabinets référencés</p>
            </div>
            <div className="px-4">
              <p className="text-3xl font-semibold tabular-nums">
                {cityCount.toLocaleString('fr-FR')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">villes couvertes</p>
            </div>
            <div className="px-4">
              <p className="text-3xl font-semibold tabular-nums">{deptCount}</p>
              <p className="text-sm text-muted-foreground mt-1">départements</p>
            </div>
          </div>
        </Container>
      </div>

      {/* ── Top villes ── */}
      <Section>
        <Container size="wide">
          <h2 className="text-2xl font-semibold tracking-tight mb-1">
            Cabinets comptables par ville
          </h2>
          <p className="text-muted-foreground mb-6">
            Les villes les plus représentées dans l&apos;annuaire
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {topCities.map((city) => (
              <Link
                key={city.key}
                href={`/cabinets-comptables/${city.key}`}
                className="group flex flex-col rounded-lg border bg-card p-3 hover:border-foreground/20 transition-colors"
              >
                <span className="text-sm font-medium leading-snug">
                  {formatCityDisplay(city)}{' '}
                  <span className="text-muted-foreground font-normal">({city.dptCode})</span>
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {city.cabinetCount} cabinet{city.cabinetCount > 1 ? 's' : ''}
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  )
}
