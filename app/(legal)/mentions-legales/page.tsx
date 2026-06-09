import type { Metadata } from 'next'
import Link from 'next/link'
import { canonicalUrl, buildBreadcrumbsJsonLd } from '@/lib/seo'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SiteBreadcrumb } from '@/components/layout/breadcrumb'
import { JsonLd } from '@/components/seo/json-ld'

export function generateMetadata(): Metadata {
  return {
    title: 'Mentions légales',
    robots: { index: false, follow: false },
    alternates: { canonical: canonicalUrl('/mentions-legales') },
  }
}

export default function MentionsLegalesPage() {
  const pageUrl = canonicalUrl('/mentions-legales')

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Mentions légales',
    url: pageUrl,
  }

  const breadcrumbJsonLd = buildBreadcrumbsJsonLd([
    { name: 'Accueil', url: canonicalUrl('/') },
    { name: 'Mentions légales' },
  ])

  return (
    <>
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <SiteBreadcrumb
        items={[{ label: 'Accueil', href: '/' }, { label: 'Mentions légales' }]}
      />

      <Section>
        <Container size="narrow">
          <h1 className="text-3xl font-semibold tracking-tight mb-8">Mentions légales</h1>

          <div className="space-y-8 text-sm leading-relaxed">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Éditeur du site</h2>
              <p className="text-muted-foreground">
                Ce site est édité par un particulier dans le cadre d&apos;un projet personnel.
                Pour toute demande de suppression de fiche, utilisez notre{' '}
                <Link
                  href="/supprimer-ma-fiche"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  formulaire de suppression
                </Link>
                .
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Hébergement</h2>
              <p className="text-muted-foreground">
                Le site est hébergé par un prestataire tiers. Les informations relatives à
                l&apos;hébergeur seront mises à jour lors du déploiement en production.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Propriété intellectuelle
              </h2>
              <p className="text-muted-foreground">
                Les données des cabinets comptables proviennent de sources publiques (Google Maps,
                registre SIRENE / INSEE). Leur reproduction à des fins commerciales est interdite
                sans autorisation préalable.
              </p>
              <p className="mt-2 text-muted-foreground">
                Le code source de ce site est la propriété de l&apos;éditeur.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Données personnelles</h2>
              <p className="text-muted-foreground">
                Voir notre{' '}
                <Link
                  href="/confidentialite"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  politique de confidentialité
                </Link>
                .
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Contact</h2>
              <p className="text-muted-foreground">
                Pour toute demande concernant vos données personnelles ou la suppression de votre
                fiche, utilisez notre{' '}
                <Link
                  href="/supprimer-ma-fiche"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  formulaire de suppression de fiche
                </Link>
                .
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
