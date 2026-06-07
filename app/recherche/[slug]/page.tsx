import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { SiteBreadcrumb } from '@/components/layout/breadcrumb'
import { CabinetGrid } from '@/components/listing/cabinet-grid'
import { JsonLd } from '@/components/seo/json-ld'
import { getCabinetsByTaxonomy } from '@/lib/cabinets'
import { slugToTaxonomyEntry, getAllSpecialiteParams } from '@/lib/taxonomies'
import {
  buildSpecialiteTitle,
  buildSpecialiteDescription,
  buildCollectionPageJsonLd,
  buildBreadcrumbsJsonLd,
  canonicalUrl,
} from '@/lib/seo'

export async function generateStaticParams() {
  return getAllSpecialiteParams()
}

interface SpecialitePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: SpecialitePageProps): Promise<Metadata> {
  const { slug } = await params
  const entry = slugToTaxonomyEntry(slug)
  if (!entry) return { robots: { index: false } }

  const cabinets = await getCabinetsByTaxonomy(entry.type, entry.key)
  const title = buildSpecialiteTitle(entry.label, cabinets.length)
  const description = buildSpecialiteDescription(entry.label, cabinets.length)
  const url = canonicalUrl(`/recherche/${slug}`)

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
  }
}

export default async function SpecialitePage({ params }: SpecialitePageProps) {
  const { slug } = await params
  const entry = slugToTaxonomyEntry(slug)
  if (!entry) notFound()

  const cabinets = await getCabinetsByTaxonomy(entry.type, entry.key)
  const url = canonicalUrl(`/recherche/${slug}`)
  const title = buildSpecialiteTitle(entry.label, cabinets.length)
  const description = buildSpecialiteDescription(entry.label, cabinets.length)

  const collectionJsonLd = buildCollectionPageJsonLd({
    url,
    name: title,
    description,
    cabinets: cabinets.slice(0, 10).map((c) => ({
      title: c.title,
      cityKey: c.cityKey,
      slug: c.slug,
    })),
  })

  const breadcrumbJsonLd = buildBreadcrumbsJsonLd([
    { name: 'Accueil', url: canonicalUrl('/') },
    { name: `Expert-comptable ${entry.label}` },
  ])

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: `Expert-comptable ${entry.label}` },
  ]

  const displayCount = cabinets.length >= 50 ? '50+' : String(cabinets.length)

  return (
    <main id="main-content">
      <JsonLd data={collectionJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <SiteBreadcrumb items={breadcrumbItems} />

      <Container size="wide" className="py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">
            Expert-comptable spécialisé {entry.label}
          </h1>
          <p className="text-muted-foreground">
            {cabinets.length > 0
              ? `${displayCount} cabinet${cabinets.length > 1 ? 's' : ''} référencé${cabinets.length > 1 ? 's' : ''} en France`
              : 'Aucun cabinet référencé pour cette spécialité'}
          </p>
        </div>

        {cabinets.length > 0 ? (
          <CabinetGrid cabinets={cabinets} />
        ) : (
          <p className="text-muted-foreground text-center py-12">
            Aucun cabinet trouvé pour cette spécialité.
          </p>
        )}
      </Container>
    </main>
  )
}
