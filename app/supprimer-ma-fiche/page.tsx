import type { Metadata } from 'next'
import { canonicalUrl, buildBreadcrumbsJsonLd } from '@/lib/seo'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SiteBreadcrumb } from '@/components/layout/breadcrumb'
import { JsonLd } from '@/components/seo/json-ld'
import { RemovalRequestForm } from '@/components/legal/removal-request-form'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Supprimer ma fiche — Demande RGPD',
    robots: { index: false, follow: false },
    alternates: { canonical: canonicalUrl('/supprimer-ma-fiche') },
  }
}

export default function SupprimerMaFichePage() {
  const pageUrl = canonicalUrl('/supprimer-ma-fiche')

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Supprimer ma fiche — Demande RGPD',
    url: pageUrl,
  }

  const breadcrumbJsonLd = buildBreadcrumbsJsonLd([
    { name: 'Accueil', url: canonicalUrl('/') },
    { name: 'Supprimer ma fiche' },
  ])

  return (
    <>
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <SiteBreadcrumb
        items={[{ label: 'Accueil', href: '/' }, { label: 'Supprimer ma fiche' }]}
      />

      <Section>
        <Container size="narrow">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Demande de suppression de fiche
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Vous êtes expert-comptable et souhaitez retirer votre fiche de cet annuaire ?
            Remplissez ce formulaire. Votre demande sera traitée sous 72 heures ouvrées.
          </p>

          <RemovalRequestForm />
        </Container>
      </Section>
    </>
  )
}
