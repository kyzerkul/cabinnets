'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchBarProps {
  defaultValue?: string
  placeholder?: string
}

export function SearchBar({
  defaultValue = '',
  placeholder = 'Ville, code postal, nom de cabinet…',
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    if (q.length < 2) return
    router.push(`/recherche?q=${encodeURIComponent(q)}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2"
      role="search"
      aria-label="Rechercher un cabinet comptable"
    >
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
        autoFocus
        minLength={2}
        aria-label="Terme de recherche"
      />
      <Button type="submit">
        <Search className="h-4 w-4 mr-2" aria-hidden="true" />
        Rechercher
      </Button>
    </form>
  )
}
