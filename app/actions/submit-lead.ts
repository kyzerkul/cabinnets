'use server'

export async function submitLead(
  _formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  // Phase 2: validate with Zod, write Lead to Postgres, email matched cabinet(s)
  return { ok: false, error: 'Ce service sera bientôt disponible.' }
}
