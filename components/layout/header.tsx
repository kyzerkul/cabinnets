import Link from 'next/link'
import { Search } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { SITE_NAME } from '@/lib/seo'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <Container size="wide" className="flex h-14 items-center justify-between">
        <Link
          href="/"
          className="font-semibold text-base text-foreground hover:text-primary transition-colors"
        >
          {SITE_NAME}
        </Link>
        <Link
          href="/recherche"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Rechercher un cabinet comptable"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Rechercher</span>
        </Link>
      </Container>
    </header>
  )
}
