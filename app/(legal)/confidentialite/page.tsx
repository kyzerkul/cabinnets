import type { Metadata } from 'next'
import Link from 'next/link'
import { canonicalUrl, buildBreadcrumbsJsonLd } from '@/lib/seo'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SiteBreadcrumb } from '@/components/layout/breadcrumb'
import { JsonLd } from '@/components/seo/json-ld'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Politique de confidentialité',
    robots: { index: false, follow: false },
    alternates: { canonical: canonicalUrl('/confidentialite') },
  }
}

export default function ConfidentialitePage() {
  const pageUrl = canonicalUrl('/confidentialite')

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Politique de confidentialité',
    url: pageUrl,
  }

  const breadcrumbJsonLd = buildBreadcrumbsJsonLd([
    { name: 'Accueil', url: canonicalUrl('/') },
    { name: 'Confidentialité' },
  ])

  return (
    <>
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <SiteBreadcrumb
        items={[{ label: 'Accueil', href: '/' }, { label: 'Confidentialité' }]}
      />

      <Section>
        <Container size="narrow">
          <h1 className="text-3xl font-semibold tracking-tight mb-8">
            Politique de confidentialité
          </h1>

          <div className="space-y-8 text-sm leading-relaxed">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Données collectées</h2>
              <p className="text-muted-foreground">
                Ce site n&apos;utilise pas de cookies de traçage ni de scripts d&apos;analyse tiers.
              </p>
              <p className="mt-2 text-muted-foreground">
                Les données des cabinets comptables (nom, adresse, téléphone, horaires) proviennent
                de sources publiques :
              </p>
              <ul className="mt-2 list-disc list-inside space-y-1 text-muted-foreground">
                <li>Google Maps (via extraction publique)</li>
                <li>Registre SIRENE / base SIREN de l&apos;INSEE (données publiques)</li>
                <li>Descriptions générées à partir d&apos;informations publiques</li>
              </ul>
              <p className="mt-2 text-muted-foreground">
                Ces données sont des informations professionnelles, non des données personnelles au
                sens du RGPD (elles concernent des personnes morales et des activités commerciales).
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Formulaire de suppression
              </h2>
              <p className="text-muted-foreground">
                Lorsque vous utilisez le{' '}
                <Link
                  href="/supprimer-ma-fiche"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  formulaire de suppression de fiche
                </Link>
                , nous collectons : votre nom, votre adresse email, le nom du cabinet concerné et
                votre message. Ces données sont utilisées uniquement pour traiter votre demande et
                sont supprimées après traitement (sous 30 jours).
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Vos droits (RGPD)</h2>
              <p className="text-muted-foreground">
                Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
                de suppression et de portabilité de vos données.
              </p>
              <p className="mt-2 text-muted-foreground">
                Pour exercer ces droits, utilisez notre{' '}
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
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Hébergement des données
              </h2>
              <p className="text-muted-foreground">Les données sont hébergées en Union Européenne.</p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
