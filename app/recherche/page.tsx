import type { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { SearchBar } from '@/components/search/search-bar'
import { CabinetGrid } from '@/components/listing/cabinet-grid'
import { searchCabinets } from '@/lib/cabinets'

export const metadata: Metadata = {
  title: 'Recherche de cabinets comptables',
  robots: { index: false, follow: false },
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function RecherchePage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = (q ?? '').trim()
  const hasQuery = query.length >= 2
  const results = hasQuery ? await searchCabinets(query) : []

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
                  {results.length === 20
                    ? `20 premiers résultats pour « ${query} »`
                    : `${results.length} résultat${results.length > 1 ? 's' : ''} pour « ${query} »`}
                </p>
                <CabinetGrid cabinets={results} />
              </>
            ) : (
              <p className="text-muted-foreground mt-12 text-center">
                Aucun cabinet trouvé pour «&nbsp;{query}&nbsp;». Essayez avec le nom de
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
