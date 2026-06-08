import type { Metadata } from 'next'
import { getAllRegions, getDeptsByRegion } from '@/lib/cities'
import { countCabinetsByDept, getTotalCabinetCount } from '@/lib/cabinets'
import { buildBreadcrumbsJsonLd, canonicalUrl } from '@/lib/seo'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SiteBreadcrumb } from '@/components/layout/breadcrumb'
import { DeptsByRegionGrid } from '@/components/listing/depts-by-region-grid'
import { JsonLd } from '@/components/seo/json-ld'

const PAGE_CANONICAL = '/cabinets-comptables/departements'
const PAGE_TITLE = 'Cabinets comptables par département — Annuaire France'
const PAGE_DESCRIPTION =
  'Trouvez un cabinet comptable dans votre département. Annuaire de tous les départements français : experts-comptables référencés par zone géographique.'

export async function generateMetadata(): Promise<Metadata> {
  const canonical = canonicalUrl(PAGE_CANONICAL)
  return {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      url: canonical,
      locale: 'fr_FR',
      type: 'website',
    },
  }
}

export default async function DepartementsPage() {
  const [regions, totalCount] = await Promise.all([getAllRegions(), getTotalCabinetCount()])

  const regionGroups = await Promise.all(
    regions.map(async (region) => {
      const depts = await getDeptsByRegion(region.code)
      const deptsWithCount = await Promise.all(
        depts.map(async (d) => ({
          code: d.code,
          name: d.name,
          slug: d.slug,
          cabinetCount: await countCabinetsByDept(d.code),
        })),
      )
      // Sort by cabinet count desc, then alphabetically — done server-side once
      deptsWithCount.sort(
        (a, b) => b.cabinetCount - a.cabinetCount || a.name.localeCompare(b.name, 'fr'),
      )
      return {
        regionName: region.name,
        regionSlug: region.slug,
        depts: deptsWithCount,
      }
    }),
  )

  const deptCount = regionGroups.reduce((sum, g) => sum + g.depts.length, 0)

  const breadcrumbs = [
    { name: 'Accueil', url: canonicalUrl('/') },
    { name: 'Cabinets comptables par département' },
  ]

  return (
    <>
      <JsonLd data={buildBreadcrumbsJsonLd(breadcrumbs)} />

      <SiteBreadcrumb items={breadcrumbs.map((b) => ({ label: b.name, href: b.url }))} />

      <Container size="wide">
        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Cabinets comptables par département
          </h1>
          <p className="mt-2 text-muted-foreground">
            {totalCount} cabinets comptables référencés dans {deptCount} département
            {deptCount !== 1 ? 's' : ''}
          </p>
        </div>

        <Section>
          <DeptsByRegionGrid regions={regionGroups} />
        </Section>
      </Container>
    </>
  )
}
