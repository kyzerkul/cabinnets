import type { Metadata } from 'next'
import { cache } from 'react'
import Link from 'next/link'
import { getTotalCabinetCount } from '@/lib/cabinets'
import {
  getDeptCount,
  getCityCount,
  getTopCitiesByCabinetCount,
  getRegionsWithCabinetCount,
} from '@/lib/cities'
import { SERVICES, SECTEURS } from '@/lib/taxonomies'
import {
  buildHomepageTitle,
  buildHomepageDescription,
  buildWebsiteJsonLd,
  buildOrganizationJsonLd,
  buildFaqJsonLd,
  canonicalUrl,
  formatCityDisplay,
  HOMEPAGE_FAQ,
} from '@/lib/seo'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { JsonLd } from '@/components/seo/json-ld'
import { HomepageSearch } from '@/components/homepage-search'

const loadData = cache(async () => {
  const [total, deptCount, cityCount, topCities, regions] = await Promise.all([
    getTotalCabinetCount(),
    getDeptCount(),
    getCityCount(),
    getTopCitiesByCabinetCount(30),
    getRegionsWithCabinetCount(),
  ])
  return { total, deptCount, cityCount, topCities, regions }
})

export async function generateMetadata(): Promise<Metadata> {
  const { total, deptCount } = await loadData()
  const title = buildHomepageTitle()
  const description = buildHomepageDescription({ total, dptCount: deptCount })
  return {
    title: { absolute: `${title} — ${total} cabinets en France` },
    description,
    alternates: { canonical: canonicalUrl('/') },
    openGraph: { title, description, url: canonicalUrl('/') },
  }
}

export default async function HomePage() {
  const { total, deptCount, cityCount, topCities, regions } = await loadData()
  const description = buildHomepageDescription({ total, dptCount: deptCount })

  return (
    <>
      <JsonLd data={buildWebsiteJsonLd()} />
      <JsonLd data={buildOrganizationJsonLd()} />
      <JsonLd data={buildFaqJsonLd(HOMEPAGE_FAQ)} />

      {/* ── Hero ── */}
      <Section className="bg-secondary">
        <Container size="narrow" className="text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Annuaire des cabinets comptables en France
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-prose mx-auto">{description}</p>
          <HomepageSearch />
          <p className="text-sm text-muted-foreground mt-4">
            Ou{' '}
            <Link href="/cabinets-comptables/departements" className="underline underline-offset-2">
              parcourez l&apos;annuaire par département
            </Link>
            .
          </p>
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

      {/* ── Régions ── */}
      <Section className="border-t bg-secondary/20">
        <Container size="wide">
          <h2 className="text-2xl font-semibold tracking-tight mb-1">
            Cabinets comptables par région
          </h2>
          <p className="text-muted-foreground mb-6">
            Les {regions.length} régions couvertes par l&apos;annuaire
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {regions.map((r) => (
              <Link
                key={r.code}
                href={`/cabinets-comptables/region/${r.slug}`}
                className="flex items-baseline justify-between gap-2 rounded-lg border bg-card px-3 py-2.5 hover:border-foreground/20 transition-colors"
              >
                <span className="text-sm font-medium leading-snug">{r.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                  {r.cabinetCount}
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-6 text-sm">
            <Link
              href="/cabinets-comptables/departements"
              className="underline underline-offset-2 hover:text-foreground text-muted-foreground"
            >
              Voir la liste complète des {deptCount} départements →
            </Link>
          </p>
        </Container>
      </Section>

      {/* ── Spécialités & secteurs ── */}
      <Section className="border-t">
        <Container size="wide">
          <h2 className="text-2xl font-semibold tracking-tight mb-1">
            Trouver un expert-comptable par spécialité
          </h2>
          <p className="text-muted-foreground mb-6 max-w-prose">
            Tous les cabinets ne font pas le même métier. Un cabinet rompu à la paie ne vaut pas un
            spécialiste de la transmission d&apos;entreprise. Ces pages regroupent les cabinets
            selon la mission recherchée.
          </p>
          <ul className="flex flex-wrap gap-2 mb-8">
            {Object.entries(SERVICES).map(([key, label]) => (
              <li key={key}>
                <Link
                  href={`/recherche/expert-comptable-${key}`}
                  className="inline-block rounded-full border bg-card px-3 py-1.5 text-sm hover:border-foreground/20 transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold tracking-tight mb-1">…ou par secteur d&apos;activité</h3>
          <p className="text-muted-foreground mb-4 max-w-prose">
            Un cabinet qui suit déjà des entreprises de votre secteur connaît vos obligations
            déclaratives et vos écritures courantes.
          </p>
          <ul className="flex flex-wrap gap-2">
            {Object.entries(SECTEURS).map(([key, label]) => (
              <li key={key}>
                <Link
                  href={`/recherche/expert-comptable-${key}`}
                  className="inline-block rounded-full border bg-card px-3 py-1.5 text-sm hover:border-foreground/20 transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ── Contenu éditorial ── */}
      <Section className="border-t bg-secondary/20">
        <Container size="narrow">
          <h2 className="text-2xl font-semibold tracking-tight mb-6">
            Bien choisir son cabinet d&apos;expertise comptable
          </h2>

          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Un expert-comptable ne se limite pas à produire un bilan une fois par an. Sur la durée,
              c&apos;est souvent le seul interlocuteur qui voit passer à la fois vos chiffres, vos
              contrats et vos échéances fiscales — et le premier à pouvoir vous alerter quand quelque
              chose dérape. D&apos;où l&apos;intérêt de choisir en connaissance de cause plutôt que
              de prendre le premier cabinet disponible.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Vérifiez l&apos;inscription à l&apos;Ordre
              </h3>
              <p>
                Le titre d&apos;expert-comptable est protégé. Seul un professionnel inscrit au
                tableau de l&apos;Ordre des experts-comptables peut tenir, centraliser ou arrêter la
                comptabilité d&apos;un tiers. Les cabinets référencés ici exercent sous ce statut,
                mais l&apos;inscription se vérifie en quelques secondes sur le tableau officiel de
                l&apos;Ordre : faites-le avant de signer.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                La proximité compte encore
              </h3>
              <p>
                La comptabilité se dématérialise, mais un point annuel sur le bilan, une question de
                trésorerie ou un contrôle fiscal se règlent nettement mieux en face à face. Un
                cabinet dans votre département connaît aussi les interlocuteurs locaux — services
                fiscaux, URSSAF, banques, greffe du tribunal de commerce. C&apos;est la raison
                d&apos;être des {cityCount.toLocaleString('fr-FR')} pages villes de cet annuaire.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Exigez une lettre de mission détaillée
              </h3>
              <p>
                Les honoraires sont libres, donc le devis ne veut rien dire sans son périmètre. La
                lettre de mission doit indiquer noir sur blanc ce qui est inclus : tenue, révision,
                liasse fiscale, déclarations de TVA, bulletins de paie, assemblée générale,
                accompagnement en cas de contrôle. C&apos;est ce document, et pas le tarif mensuel
                affiché, qui détermine ce que vous paierez réellement sur l&apos;exercice.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Comparez au moins trois cabinets
              </h3>
              <p>
                Les écarts de prix pour une mission identique dépassent fréquemment 40 % d&apos;un
                cabinet à l&apos;autre, sans corrélation nette avec la qualité du service. Prenez
                trois devis, sur le même périmètre, et posez la même question à chacun : qui sera mon
                interlocuteur au quotidien, et sous quel délai me répond-il ?
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-lg border bg-card p-6">
            <p className="font-medium text-foreground mb-2">
              Vous ne savez pas par où commencer ?
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Décrivez votre besoin en deux minutes, nous le transmettons à des cabinets de votre
              secteur. Gratuit et sans engagement.
            </p>
            <Link
              href="/demander-un-devis"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Demander un devis gratuit
            </Link>
          </div>
        </Container>
      </Section>

      {/* ── FAQ ── */}
      <Section className="border-t">
        <Container size="narrow">
          <h2 className="text-2xl font-semibold tracking-tight mb-6">Questions fréquentes</h2>
          <div className="divide-y border-y">
            {HOMEPAGE_FAQ.map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="cursor-pointer list-none font-medium marker:content-none flex items-start justify-between gap-4">
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className="text-muted-foreground shrink-0 transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-muted-foreground leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── Transparence sur les données ── */}
      <Section className="border-t bg-secondary/20">
        <Container size="narrow">
          <h2 className="text-xl font-semibold tracking-tight mb-4">
            D&apos;où viennent les données de cet annuaire
          </h2>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              Chaque fiche est construite à partir de sources publiques : coordonnées, horaires
              d&apos;ouverture et avis proviennent des fiches d&apos;établissement publiées en ligne
              par les cabinets eux-mêmes ; les informations légales (SIREN, forme juridique, date de
              création, tranche d&apos;effectif) proviennent de la base SIRENE de l&apos;INSEE.
            </p>
            <p>
              Cet annuaire est indépendant. Nous ne vendons pas de position dans les classements et
              nous ne sommes affiliés à aucun cabinet ni à aucun réseau. Les listes sont triées par
              note et par nombre d&apos;avis, jamais par contrepartie financière.
            </p>
            <p>
              Vous dirigez un cabinet et une information est inexacte ? Vous pouvez demander sa
              correction ou la{' '}
              <Link href="/supprimer-ma-fiche" className="underline underline-offset-2">
                suppression de votre fiche
              </Link>{' '}
              à tout moment, conformément au RGPD. Voir aussi nos{' '}
              <Link href="/mentions-legales" className="underline underline-offset-2">
                mentions légales
              </Link>
              .
            </p>
          </div>
        </Container>
      </Section>
    </>
  )
}
