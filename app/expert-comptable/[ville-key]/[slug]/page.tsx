import { notFound } from 'next/navigation'
import { cache } from 'react'
import type { Metadata } from 'next'
import {
  getCabinet,
  getAllCabinetSlugs,
  getCabinetsProches,
  getPeopleAlsoSearchCabinets,
} from '@/lib/cabinets'
import {
  buildFicheTitle,
  buildFicheDescription,
  buildFicheJsonLd,
  buildBreadcrumbsJsonLd,
  canonicalUrl,
  formatCityDisplay,
} from '@/lib/seo'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SiteBreadcrumb } from '@/components/layout/breadcrumb'
import { JsonLd } from '@/components/seo/json-ld'
import { FicheHero } from '@/components/cabinet/fiche-hero'
import { ContactBlock } from '@/components/cabinet/contact-block'
import { OpeningHours } from '@/components/cabinet/opening-hours'
import { ServicesBadges } from '@/components/cabinet/services-badges'
import { MapEmbed } from '@/components/cabinet/map-embed'
import { CabinetCard } from '@/components/cabinet/cabinet-card'
import { RequestQuoteSlot } from '@/components/monetization/request-quote-slot'
import { ClaimCta } from '@/components/monetization/claim-cta'

type Props = {
  params: Promise<{ 'ville-key': string; slug: string }>
}

// Deduplicate Prisma calls within the same request
const loadCabinet = cache(async (slug: string) => getCabinet(slug))

export async function generateStaticParams() {
  const slugs = await getAllCabinetSlugs()
  return slugs.map(({ slug, cityKey }) => ({
    'ville-key': cityKey,
    slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cabinet = await loadCabinet(slug)
  if (!cabinet) return {}

  const dptCode = cabinet.city.dptCode
  const title = buildFicheTitle({ cabinetName: cabinet.title, city: cabinet.city, dptCode })
  const description = buildFicheDescription({
    cabinetName: cabinet.title,
    city: cabinet.city,
    dptCode,
    rating: cabinet.ratingValue,
    ratingCount: cabinet.ratingCount,
    phone: cabinet.phoneDisplay,
    description: cabinet.description,
  })
  const canonical = canonicalUrl(`/expert-comptable/${cabinet.cityKey}/${cabinet.slug}`)

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  }
}

export default async function FicheCabinetPage({ params }: Props) {
  const { 'ville-key': villeKey, slug } = await params
  const cabinet = await loadCabinet(slug)

  // 404 if not found or accessed via wrong ville-key
  if (!cabinet || cabinet.cityKey !== villeKey) notFound()

  const [prochesResult, pasResult] = await Promise.allSettled([
    getCabinetsProches(cabinet),
    getPeopleAlsoSearchCabinets(cabinet),
  ])
  const proches = prochesResult.status === 'fulfilled' ? prochesResult.value : []
  const pas = pasResult.status === 'fulfilled' ? pasResult.value : []

  const city = cabinet.city
  const dept = city.department
  const region = dept.region
  const ville = formatCityDisplay(city)
  const canonical = canonicalUrl(`/expert-comptable/${cabinet.cityKey}/${cabinet.slug}`)

  const ficheJsonLd = buildFicheJsonLd(cabinet)
  const breadcrumbJsonLd = buildBreadcrumbsJsonLd([
    { name: 'Accueil', url: canonicalUrl('/') },
    {
      name: `Cabinets en ${region.name}`,
      url: canonicalUrl(`/cabinets-comptables/region/${region.slug}`),
    },
    {
      name: dept.name,
      url: canonicalUrl(`/cabinets-comptables/departement/${dept.slug}`),
    },
    {
      name: `Cabinets à ${ville}`,
      url: canonicalUrl(`/cabinets-comptables/${cabinet.cityKey}`),
    },
    { name: cabinet.title },
  ])

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: region.name, href: `/cabinets-comptables/region/${region.slug}` },
    { label: dept.name, href: `/cabinets-comptables/departement/${dept.slug}` },
    { label: `Cabinets à ${ville}`, href: `/cabinets-comptables/${cabinet.cityKey}` },
    { label: cabinet.title },
  ]

  const hasLegalInfo =
    cabinet.siren &&
    (cabinet.formeJuridiqueLabel || cabinet.dateCreation || cabinet.trancheEffectifLabel)

  return (
    <>
      <JsonLd data={ficheJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <SiteBreadcrumb items={breadcrumbItems} />
      <FicheHero cabinet={cabinet} />

      <Section>
        <Container size="wide">
          <div className="grid md:grid-cols-3 gap-8">
            {/* ── Colonne principale ── */}
            <div className="md:col-span-2 space-y-8">
              {cabinet.description && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">À propos</h2>
                  <p className="text-muted-foreground leading-relaxed">{cabinet.description}</p>
                </div>
              )}

              {/* CTA devis en colonne principale — visible dès le premier scroll mobile */}
              <RequestQuoteSlot />

              {(cabinet.services.length > 0 ||
                cabinet.secteurs.length > 0 ||
                cabinet.languesEtrangeres.length > 0) && (
                <ServicesBadges
                  services={cabinet.services}
                  secteurs={cabinet.secteurs}
                  langues={cabinet.languesEtrangeres}
                />
              )}

              <div>
                <h2 className="text-lg font-semibold mb-3">Localisation</h2>
                <MapEmbed
                  latitude={cabinet.latitude}
                  longitude={cabinet.longitude}
                  name={cabinet.title}
                />
              </div>

              {cabinet.workHours && <OpeningHours workHours={cabinet.workHours} />}

              {hasLegalInfo && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Informations légales</h2>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">SIREN</dt>
                    <dd className="font-mono">{cabinet.siren}</dd>
                    {cabinet.formeJuridiqueLabel && (
                      <>
                        <dt className="text-muted-foreground">Forme juridique</dt>
                        <dd>{cabinet.formeJuridiqueLabel}</dd>
                      </>
                    )}
                    {cabinet.dateCreation && (
                      <>
                        <dt className="text-muted-foreground">Création</dt>
                        <dd>{cabinet.dateCreation}</dd>
                      </>
                    )}
                    {cabinet.trancheEffectifLabel && (
                      <>
                        <dt className="text-muted-foreground">Effectif</dt>
                        <dd>{cabinet.trancheEffectifLabel}</dd>
                      </>
                    )}
                  </dl>
                </div>
              )}
            </div>

            {/* ── Sidebar (desktop uniquement en pratique) ── */}
            <div className="space-y-4">
              <ContactBlock cabinet={cabinet} />
              <ClaimCta cabinetName={cabinet.title} />
            </div>
          </div>
        </Container>
      </Section>

      {proches.length > 0 && (
        <Section className="border-t">
          <Container size="wide">
            <h2 className="text-xl font-semibold mb-5">
              Autres cabinets comptables à {ville}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {proches.map((c) => (
                <CabinetCard key={c.placeId} cabinet={c} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {pas.length > 0 && (
        <Section className="border-t bg-secondary/20">
          <Container size="wide">
            <h2 className="text-xl font-semibold mb-5">Cabinets souvent consultés ensemble</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pas.map((c) => (
                <CabinetCard key={c.placeId} cabinet={c} />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  )
}
