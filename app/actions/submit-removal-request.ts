'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  cabinetName: z.string().min(2).max(200),
  address: z.string().max(300).optional(),
  reason: z.string().min(10).max(2000),
})

export async function submitRemovalRequest(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    cabinetName: formData.get('cabinetName'),
    address: formData.get('address') || undefined,
    reason: formData.get('reason'),
  }

  const parsed = schema.safeParse(raw)

  if (!parsed.success) {
    return { ok: false, error: 'Veuillez remplir tous les champs obligatoires correctement.' }
  }

  try {
    await prisma.removalRequest.create({ data: parsed.data })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Une erreur est survenue. Veuillez réessayer.' }
  }
}
