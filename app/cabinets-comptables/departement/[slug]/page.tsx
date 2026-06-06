import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllDepts, getDeptBySlug, getCitiesByDeptWithCount, getDeptsByRegion } from '@/lib/cities'
import { getCabinetsByDept, countCabinetsByDept } from '@/lib/cabinets'
import {
  buildDeptTitle,
  buildDeptDescription,
  buildCollectionPageJsonLd,
  buildBreadcrumbsJsonLd,
  canonicalUrl,
} from '@/lib/seo'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Badge } from '@/components/ui/badge'
import { SiteBreadcrumb } from '@/components/layout/breadcrumb'
import { CabinetGrid } from '@/components/listing/cabinet-grid'
import { DeptCitiesGrid } from '@/components/listing/dept-cities-grid'
import { JsonLd } from '@/components/seo/json-ld'

export const dynamicParams = false

export async function generateStaticParams() {
  const depts = await getAllDepts()
  return depts.map((d) => ({ slug: d.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const dept = await getDeptBySlug(slug)
  if (!dept) return {}
  const count = await countCabinetsByDept(dept.code)
  const title = buildDeptTitle({ dptName: dept.name, dptCode: dept.code, count })
  const description = buildDeptDescription({ dptName: dept.name, dptCode: dept.code, count })
  const canonical = canonicalUrl(`/cabinets-comptables/departement/${dept.slug}`)
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, locale: 'fr_FR', type: 'website' },
  }
}

export default async function DeptPage({ params }: Props) {
  const { slug } = await params
  const dept = await getDeptBySlug(slug)
  if (!dept) notFound()

  const [cabinets, cities, siblingDepts, totalCount] = await Promise.all([
    getCabinetsByDept(dept.code, 12),
    getCitiesByDeptWithCount(dept.code),
    getDeptsByRegion(dept.region.code),
    countCabinetsByDept(dept.code),
  ])

  const pageUrl = canonicalUrl(`/cabinets-comptables/departement/${dept.slug}`)
  const breadcrumbs = [
    { name: 'Accueil', url: canonicalUrl('/') },
    {
      name: dept.region.name,
      url: canonicalUrl(`/cabinets-comptables/region/${dept.region.slug}`),
    },
    { name: dept.name },
  ]

  const otherDepts = siblingDepts.filter((d) => d.code !== dept.code)

  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          url: pageUrl,
          name: buildDeptTitle({ dptName: dept.name, dptCode: dept.code, count: totalCount }),
          description: buildDeptDescription({
            dptName: dept.name,
            dptCode: dept.code,
            count: totalCount,
          }),
          cabinets: cabinets.slice(0, 10).map((c) => ({
            title: c.title,
            cityKey: c.cityKey,
            slug: c.slug,
          })),
        })}
      />
      <JsonLd data={buildBreadcrumbsJsonLd(breadcrumbs)} />

      <SiteBreadcrumb
        items={breadcrumbs.map((b) => ({ label: b.name, href: b.url }))}
      />

      <Container size="wide">
        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Cabinets comptables dans le {dept.name} ({dept.code})
          </h1>
          <p className="mt-3">
            <Badge variant="secondary">
              {totalCount} expert{totalCount > 1 ? 's' : ''}-comptable
              {totalCount > 1 ? 's' : ''} référencés
            </Badge>
          </p>
        </div>

        <Section>
          <CabinetGrid cabinets={cabinets} />
        </Section>

        <Section>
          <h2 className="text-xl font-semibold mb-6">
            Villes du {dept.name}{' '}
            <span className="text-muted-foreground font-normal text-base">
              ({cities.length} ville{cities.length > 1 ? 's' : ''})
            </span>
          </h2>
          <DeptCitiesGrid cities={cities} />
        </Section>

        {otherDepts.length > 0 && (
          <Section>
            <h2 className="text-xl font-semibold mb-4">
              Autres départements en {dept.region.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              {otherDepts.map((d) => (
                <Link
                  key={d.code}
                  href={`/cabinets-comptables/departement/${d.slug}`}
                  className="text-sm border border-border rounded-md px-3 py-1.5 hover:bg-secondary transition-colors"
                >
                  {d.name} ({d.code})
                </Link>
              ))}
            </div>
          </Section>
        )}

        <div className="mt-2 pb-12 border-t border-border pt-6">
          <Link
            href={`/cabinets-comptables/region/${dept.region.slug}`}
            className="text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            ← Tous les cabinets comptables en {dept.region.name}
          </Link>
        </div>
      </Container>
    </>
  )
}
