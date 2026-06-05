'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function HomepageSearch() {
  const router = useRouter()
  const [q, setQ] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = q.trim()
    if (trimmed) router.push(`/recherche?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ville, code postal…"
        className="flex-1"
        aria-label="Rechercher par ville ou code postal"
      />
      <Button type="submit">
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="ml-2 hidden sm:inline">Rechercher</span>
        <span className="sr-only sm:hidden">Rechercher</span>
      </Button>
    </form>
  )
}
