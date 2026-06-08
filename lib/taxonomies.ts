export const SERVICES: Record<string, string> = {
  comptabilite: 'Comptabilité',
  fiscalite: 'Fiscalité',
  'paie-social': 'Paie & social',
  juridique: 'Juridique',
  'audit-cac': 'Audit / CAC',
  'conseil-gestion': 'Conseil en gestion',
  'gestion-patrimoine': 'Gestion de patrimoine',
  'creation-entreprise': "Création d'entreprise",
  'conseil-strategique': 'Conseil stratégique',
  digitalisation: 'Digitalisation',
  international: 'International',
  'transmission-entreprise': "Transmission d'entreprise",
  'previsionnel-business-plan': 'Prévisionnel / business plan',
  formation: 'Formation',
  recouvrement: 'Recouvrement',
}

export const SECTEURS: Record<string, string> = {
  btp: 'BTP',
  'medical-sante': 'Médical / santé',
  'juridique-avocats': 'Juridique / avocats',
  'ecommerce-numerique': 'E-commerce / numérique',
  'restauration-chr': 'Restauration / CHR',
  'immobilier-sci': 'Immobilier / SCI',
  agricole: 'Agricole',
  associatif: 'Associatif',
  artisanat: 'Artisanat',
  industrie: 'Industrie',
  'commerce-distribution': 'Commerce',
  'transport-logistique': 'Transport',
  tpe: 'TPE',
  pme: 'PME',
  'eti-grand-groupe': 'ETI / grands groupes',
  'start-up': 'Start-up',
  'freelance-independant': 'Freelances',
  'auto-entrepreneur': 'Auto-entrepreneurs',
  'professions-liberales': 'Professions libérales',
  'holding-patrimoine': 'Holdings',
  particuliers: 'Particuliers',
  'international-export': 'International',
}

// ─── Specialité pages helpers ─────────────────────────────────────

export type TaxonomyEntry = {
  key: string
  label: string
  type: 'service' | 'secteur'
}

export function slugToTaxonomyEntry(slug: string): TaxonomyEntry | null {
  const key = slug.replace(/^expert-comptable-/, '')
  if (SERVICES[key]) return { key, label: SERVICES[key], type: 'service' }
  if (SECTEURS[key]) return { key, label: SECTEURS[key], type: 'secteur' }
  return null
}

export function getAllSpecialiteParams(): { slug: string }[] {
  const serviceParams = Object.keys(SERVICES).map((key) => ({
    slug: `expert-comptable-${key}`,
  }))
  const secteurParams = Object.keys(SECTEURS).map((key) => ({
    slug: `expert-comptable-${key}`,
  }))
  return [...serviceParams, ...secteurParams]
}
