import type { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SiteBreadcrumb } from '@/components/layout/breadcrumb'
import { canonicalUrl } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Revendiquer ma fiche cabinet',
    robots: { index: false, follow: false },
    alternates: {
      canonical: canonicalUrl('/revendiquer-ma-fiche'),
    },
  }
}

export default function RevendiquerMaFichePage() {
  return (
    <Container size="narrow">
      <SiteBreadcrumb
        items={[{ label: 'Accueil', href: '/' }, { label: 'Revendiquer ma fiche' }]}
      />
      <Section>
        <h1 className="text-3xl font-semibold mb-4">Revendiquer votre fiche cabinet</h1>
        <div className="space-y-6 text-sm text-muted-foreground">
          <p>
            Vous êtes expert-comptable et souhaitez mettre à jour les informations de votre cabinet
            sur cet annuaire ? Ce service sera disponible prochainement.
          </p>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Comment ça marchera (bientôt disponible)
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Créez un compte cabinet sécurisé</li>
              <li>Vérifiez votre identité via votre numéro SIREN</li>
              <li>Accédez à votre tableau de bord pour modifier vos informations</li>
            </ol>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">En attendant</h2>
            <p>
              Pour toute demande de modification ou de suppression de votre fiche, un formulaire
              dédié sera prochainement disponible sur ce site.
            </p>
          </div>
        </div>
      </Section>
    </Container>
  )
}
