import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { Separator } from '@/components/ui/separator'
import { SITE_NAME } from '@/lib/seo'

const REGIONS = [
  { name: 'Île-de-France',               slug: 'ile-de-france' },
  { name: 'Auvergne-Rhône-Alpes',        slug: 'auvergne-rhone-alpes' },
  { name: 'Nouvelle-Aquitaine',          slug: 'nouvelle-aquitaine' },
  { name: 'Occitanie',                   slug: 'occitanie' },
  { name: 'Hauts-de-France',             slug: 'hauts-de-france' },
  { name: 'Grand Est',                   slug: 'grand-est' },
  { name: "Provence-Alpes-Côte d'Azur", slug: 'provence-alpes-cote-d-azur' },
  { name: 'Pays de la Loire',            slug: 'pays-de-la-loire' },
  { name: 'Normandie',                   slug: 'normandie' },
  { name: 'Bretagne',                    slug: 'bretagne' },
  { name: 'Bourgogne-Franche-Comté',     slug: 'bourgogne-franche-comte' },
  { name: 'Centre-Val de Loire',         slug: 'centre-val-de-loire' },
  { name: 'Corse',                       slug: 'corse' },
]

const NAV_LINKS = [
  { label: 'Accueil', href: '/' },
  { label: 'Rechercher', href: '/recherche' },
  { label: 'Demander un devis', href: '/demander-un-devis' },
]

const LEGAL_LINKS = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Confidentialité', href: '/confidentialite' },
  { label: 'CGU', href: '/cgu' },
  { label: 'Supprimer ma fiche', href: '/supprimer-ma-fiche' },
]

const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted mt-auto">
      <Container size="wide" className="py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{SITE_NAME}</p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              L&apos;annuaire indépendant des experts-comptables en France.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Navigation</p>
            <ul className="mt-3 space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Légal</p>
            <ul className="mt-3 space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Parcourir par région</p>
          <nav aria-label="Régions">
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
              {REGIONS.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/cabinets-comptables/region/${r.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Separator className="my-8" />

        <p className="text-xs text-muted-foreground">
          © {YEAR} {SITE_NAME} — Annuaire indépendant. Les données sont issues de sources publiques.
        </p>
      </Container>
    </footer>
  )
}
