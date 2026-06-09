'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { buttonVariants } from '@/components/ui/button'
import { submitRemovalRequest } from '@/app/actions/submit-removal-request'

export function RemovalRequestForm() {
  const [pending, startTransition] = useTransition()
  const [state, setState] = useState<{ ok: true } | { ok: false; error: string } | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await submitRemovalRequest(formData)
      setState(result)
    })
  }

  if (state?.ok) {
    return (
      <div className="rounded-md border p-6 mt-6 text-center">
        <p className="font-semibold text-foreground">Demande envoyée</p>
        <p className="text-sm text-muted-foreground mt-2">
          Votre demande a bien été enregistrée. Nous la traiterons sous 72 heures ouvrées.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">
          Votre nom <span aria-hidden="true">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={100}
          aria-required="true"
          disabled={pending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">
          Votre adresse email <span aria-hidden="true">*</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          aria-required="true"
          disabled={pending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cabinetName">
          Nom du cabinet concerné <span aria-hidden="true">*</span>
        </Label>
        <Input
          id="cabinetName"
          name="cabinetName"
          type="text"
          required
          minLength={2}
          maxLength={200}
          aria-required="true"
          disabled={pending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Adresse du cabinet (optionnel)</Label>
        <Input id="address" name="address" type="text" maxLength={300} disabled={pending} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reason">
          Motif de la demande <span aria-hidden="true">*</span>
        </Label>
        <textarea
          id="reason"
          name="reason"
          required
          aria-required="true"
          disabled={pending}
          rows={5}
          minLength={10}
          maxLength={2000}
          placeholder="Ex : Je suis l'expert-comptable de ce cabinet et souhaite retirer mes informations."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
        />
      </div>

      {state && !state.ok && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={buttonVariants({ variant: 'default', size: 'default' })}
      >
        {pending ? 'Envoi en cours…' : 'Envoyer la demande'}
      </button>
    </form>
  )
}
