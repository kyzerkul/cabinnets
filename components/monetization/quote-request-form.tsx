'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { buttonVariants } from '@/components/ui/button'
import { submitLead } from '@/app/actions/submit-lead'

export function QuoteRequestForm() {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isPending) return
    setServerError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        const result = await submitLead(formData)
        if (result.ok) {
          setSubmitted(true)
        } else {
          setServerError(result.error)
        }
      } catch {
        setServerError('Une erreur est survenue. Veuillez réessayer.')
      }
    })
  }

  if (submitted) {
    return (
      <div className="rounded-md border bg-secondary/50 p-6 space-y-2 text-sm">
        <p className="font-semibold text-foreground">Demande envoyée</p>
        <p className="text-muted-foreground">
          Nous vous mettrons en relation avec des experts-comptables qualifiés dans les plus brefs
          délais.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">
            Votre nom <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            aria-required="true"
            autoComplete="name"
            placeholder="Marie Dupont"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">
            Votre email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            aria-required="true"
            autoComplete="email"
            placeholder="marie@exemple.fr"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Votre téléphone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="06 12 34 56 78"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="city">Votre ville ou département</Label>
          <Input
            id="city"
            name="city"
            type="text"
            autoComplete="address-level2"
            placeholder="Lyon, Rhône (69)…"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">
          Décrivez votre besoin <span className="text-destructive">*</span>
        </Label>
        <textarea
          id="message"
          name="message"
          required
          aria-required="true"
          minLength={20}
          rows={5}
          placeholder="Ex : je suis freelance en SASU, cherche un expert-comptable pour la TVA et les bilans, budget ~150 €/mois…"
          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={buttonVariants({ variant: 'default', size: 'lg' })}
      >
        {isPending ? 'Envoi en cours…' : 'Envoyer ma demande'}
      </button>

      {serverError && (
        <p className="text-sm text-muted-foreground border rounded-md p-3 bg-muted">
          {serverError}
        </p>
      )}
    </form>
  )
}
