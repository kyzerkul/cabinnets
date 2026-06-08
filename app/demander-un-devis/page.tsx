import type { Metadata } from 'next'
import { siteUrl, canonicalUrl, buildBreadcrumbsJsonLd } from '@/lib/seo'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SiteBreadcrumb } from '@/components/layout/breadcrumb'
import { JsonLd } from '@/components/seo/json-ld'
import { QuoteRequestForm } from '@/components/monetization/quote-request-form'
import { WhyUseSidebar } from '@/components/monetization/why-use-sidebar'

export async function generateMetadata(): Promise<Metadata> {
  const url = canonicalUrl('/demander-un-devis')
  return {
    title: 'Demander un devis à un expert-comptable — Comparateur gratuit',
    description:
      "Comparez les experts-comptables et demandez un devis gratuit. Décrivez votre besoin, recevez des propositions d'experts-comptables qualifiés dans votre région.",
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title: 'Demander un devis à un expert-comptable — Comparateur gratuit',
      description:
        "Comparez les experts-comptables et demandez un devis gratuit. Décrivez votre besoin, recevez des propositions d'experts-comptables qualifiés dans votre région.",
      url,
    },
  }
}

export default function DemanderUnDevisPage() {
  const pageUrl = canonicalUrl('/demander-un-devis')

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Demander un devis à un expert-comptable',
    description:
      "Comparez les experts-comptables et demandez un devis gratuit.",
    url: pageUrl,
    isPartOf: { '@type': 'WebSite', url: siteUrl() },
  }

  const breadcrumbJsonLd = buildBreadcrumbsJsonLd([
    { name: 'Accueil', url: canonicalUrl('/') },
    { name: 'Demander un devis' },
  ])

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Demander un devis' },
  ]

  return (
    <>
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <SiteBreadcrumb items={breadcrumbItems} />

      <Section>
        <Container>
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Demander un devis à un expert-comptable
            </h1>
            <p className="mt-3 text-muted-foreground leading-relaxed max-w-2xl">
              Décrivez votre besoin comptable, nous vous mettrons en relation avec des
              experts-comptables qualifiés. Service disponible prochainement.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <QuoteRequestForm />
            </div>
            <div>
              <WhyUseSidebar />
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
