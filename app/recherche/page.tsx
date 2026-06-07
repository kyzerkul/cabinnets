import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { SearchBar } from '@/components/search/search-bar'
import { CabinetGrid } from '@/components/listing/cabinet-grid'
import { searchCabinets, SEARCH_PER_PAGE } from '@/lib/cabinets'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Recherche de cabinets comptables',
  robots: { index: false, follow: false },
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function RecherchePage({ searchParams }: SearchPageProps) {
  const { q, page: pageParam } = await searchParams
  const query = (q ?? '').trim()
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const hasQuery = query.length >= 2

  const { results, hasMore } = hasQuery
    ? await searchCabinets(query, page)
    : { results: [], hasMore: false }

  const from = (page - 1) * SEARCH_PER_PAGE + 1
  const to = from + results.length - 1

  const pageUrl = (p: number) =>
    `/recherche?q=${encodeURIComponent(query)}&page=${p}`

  return (
    <main id="main-content">
      <Container size="wide" className="py-8 md:py-12">
        <h1 className="text-2xl font-semibold mb-6">Rechercher un expert-comptable</h1>

        <SearchBar defaultValue={query} />

        {hasQuery && (
          <div className="mt-8">
            {results.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Résultats {from}–{to} pour «&nbsp;{query}&nbsp;»
                  {!hasMore && page === 1 && ` (${results.length} au total)`}
                </p>

                <CabinetGrid cabinets={results} />

                {/* Pagination */}
                {(page > 1 || hasMore) && (
                  <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
                    {page > 1 ? (
                      <Link
                        href={pageUrl(page - 1)}
                        className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
                      >
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        Page précédente
                      </Link>
                    ) : (
                      <div />
                    )}

                    <span className="text-sm text-muted-foreground">Page {page}</span>

                    {hasMore ? (
                      <Link
                        href={pageUrl(page + 1)}
                        className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
                      >
                        Page suivante
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    ) : (
                      <div />
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground mt-12 text-center">
                Aucun cabinet trouvé pour «&nbsp;{query}&nbsp;»
                {page > 1 ? ` à la page ${page}` : ''}. Essayez avec le nom de
                la ville ou un code postal.
              </p>
            )}
          </div>
        )}

        {!hasQuery && (
          <p className="text-muted-foreground mt-12 text-center">
            Saisissez au moins 2 caractères pour lancer la recherche.
          </p>
        )}
      </Container>
    </main>
  )
}
