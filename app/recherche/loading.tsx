import { Container } from '@/components/ui/container'
import { Skeleton } from '@/components/ui/skeleton'

export default function RechercheLoading() {
  return (
    <main id="main-content">
      <Container size="wide" className="py-8 md:py-12">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-10 w-full mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </Container>
    </main>
  )
}
