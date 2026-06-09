import type { Metadata } from 'next'
import Link from 'next/link'
import { canonicalUrl, buildBreadcrumbsJsonLd } from '@/lib/seo'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SiteBreadcrumb } from '@/components/layout/breadcrumb'
import { JsonLd } from '@/components/seo/json-ld'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Conditions Générales d'Utilisation",
    robots: { index: false, follow: false },
    alternates: { canonical: canonicalUrl('/cgu') },
  }
}

export default function CguPage() {
  const pageUrl = canonicalUrl('/cgu')

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: "Conditions Générales d'Utilisation",
    url: pageUrl,
  }

  const breadcrumbJsonLd = buildBreadcrumbsJsonLd([
    { name: 'Accueil', url: canonicalUrl('/') },
    { name: 'CGU' },
  ])

  return (
    <>
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <SiteBreadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'CGU' }]} />

      <Section>
        <Container size="narrow">
          <h1 className="text-3xl font-semibold tracking-tight mb-8">
            Conditions Générales d&apos;Utilisation
          </h1>

          <div className="space-y-8 text-sm leading-relaxed">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Objet</h2>
              <p className="text-muted-foreground">
                Ce site est un annuaire de référencement de cabinets comptables en France.
                L&apos;accès au site est gratuit et sans inscription.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Données présentées</h2>
              <p className="text-muted-foreground">
                Les informations publiées sur ce site proviennent de sources publiques.
                L&apos;éditeur s&apos;efforce de maintenir ces informations à jour mais ne peut
                garantir leur exactitude à tout moment.
              </p>
              <p className="mt-2 text-muted-foreground">
                Les cabinets comptables référencés n&apos;ont pas nécessairement consenti à leur
                référencement. Conformément au RGPD, toute personne peut demander la suppression ou
                la modification de sa fiche via notre{' '}
                <Link
                  href="/supprimer-ma-fiche"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  formulaire dédié
                </Link>
                .
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Limitation de responsabilité
              </h2>
              <p className="text-muted-foreground">
                L&apos;éditeur ne saurait être tenu responsable des dommages directs ou indirects
                résultant de l&apos;utilisation de ce site ou des informations qu&apos;il contient.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Propriété intellectuelle
              </h2>
              <p className="text-muted-foreground">
                La structure et le code source de ce site sont protégés. La reproduction des données
                à des fins commerciales est interdite.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Droit applicable</h2>
              <p className="text-muted-foreground">
                Les présentes CGU sont soumises au droit français. Tout litige relève de la
                compétence des tribunaux français.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
