/**
 * Génère un fichier Markdown listant toutes les URLs du site.
 * Usage : dotenvx run -f .env -- tsx scripts/generate-urls.ts
 * Sortie : all-urls.md dans le répertoire courant.
 */

import * as fs from 'fs'
import * as path from 'path'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cabinetscomptables.online'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Taxonomies (même liste que lib/taxonomies.ts)
const SERVICES: Record<string, string> = {
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

const SECTEURS: Record<string, string> = {
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
  'international-export': 'International / export',
}

const PARIS_ARR_RE = /^paris-750\d{2}$/

async function main() {
  const lines: string[] = []
  const push = (line: string) => lines.push(line)

  push(`# Toutes les URLs — cabinetscomptables.online`)
  push(``)
  push(`Généré le ${new Date().toISOString().slice(0, 10)} · Base : ${BASE_URL}`)
  push(``)

  // ── 1. Pages statiques ──────────────────────────────────────────
  push(`## Pages statiques`)
  push(``)
  const staticPages = [
    ['/', 'Accueil'],
    ['/cabinets-comptables/departements', 'Index des départements'],
    ['/demander-un-devis', 'Demander un devis'],
    ['/recherche', 'Recherche libre'],
    ['/cgu', 'Conditions générales d\'utilisation'],
    ['/confidentialite', 'Politique de confidentialité'],
    ['/mentions-legales', 'Mentions légales'],
  ]
  for (const [path, label] of staticPages) {
    push(`- [${label}](${BASE_URL}${path})`)
  }
  push(``)

  // ── 2. Pages spécialités (services + secteurs) ──────────────────
  push(`## Pages spécialités (${Object.keys(SERVICES).length + Object.keys(SECTEURS).length} pages)`)
  push(``)
  push(`### Services`)
  push(``)
  for (const [key, label] of Object.entries(SERVICES)) {
    push(`- [Expert-comptable ${label}](${BASE_URL}/recherche/expert-comptable-${key})`)
  }
  push(``)
  push(`### Secteurs`)
  push(``)
  for (const [key, label] of Object.entries(SECTEURS)) {
    push(`- [Expert-comptable ${label}](${BASE_URL}/recherche/expert-comptable-${key})`)
  }
  push(``)

  // ── 3. Pages régions ────────────────────────────────────────────
  const regions = await prisma.region.findMany({ orderBy: { name: 'asc' } })
  push(`## Pages régions (${regions.length} pages)`)
  push(``)
  for (const r of regions) {
    push(`- [Cabinets comptables en ${r.name}](${BASE_URL}/cabinets-comptables/region/${r.slug})`)
  }
  push(``)

  // ── 4. Pages départements ───────────────────────────────────────
  const depts = await prisma.department.findMany({ orderBy: [{ name: 'asc' }], include: { region: false } })
  push(`## Pages départements (${depts.length + 1} pages)`)
  push(``)
  for (const d of depts) {
    push(`- [Cabinets comptables ${d.name} (${d.code})](${BASE_URL}/cabinets-comptables/departement/${d.slug})`)
  }
  push(``)

  // ── 5. Pages villes (hors arrondissements Paris) ─────────────────
  const allCityRows = await prisma.city.findMany({
    where: { NOT: { key: { startsWith: 'paris-750' } } },
    select: { key: true, name: true, zip: true },
    orderBy: { name: 'asc' },
  })
  push(`## Pages villes (${allCityRows.length} pages)`)
  push(``)
  for (const c of allCityRows) {
    push(`- [Cabinets comptables à ${c.name} (${c.zip})](${BASE_URL}/cabinets-comptables/${c.key})`)
  }
  push(``)

  // ── 6. Pages arrondissements Paris ──────────────────────────────
  const parisRows = await prisma.city.findMany({
    where: { key: { startsWith: 'paris-750' } },
    select: { key: true, name: true, zip: true },
    orderBy: { zip: 'asc' },
  })
  push(`## Pages arrondissements de Paris (${parisRows.length} pages)`)
  push(``)
  for (const c of parisRows) {
    const m = c.key.match(/^paris-750(\d{2})$/)
    const label = m ? `Paris ${parseInt(m[1], 10) === 1 ? '1er' : `${parseInt(m[1], 10)}e`}` : c.name
    push(`- [Cabinets comptables ${label} (${c.zip})](${BASE_URL}/cabinets-comptables/${c.key})`)
  }
  push(``)

  // ── 7. Fiches cabinets ─────────────────────────────────────────
  const cabinets = await prisma.cabinet.findMany({
    where: { isDeleted: false },
    select: { slug: true, cityKey: true, title: true },
    orderBy: [{ cityKey: 'asc' }, { slug: 'asc' }],
  })
  push(`## Fiches cabinets experts-comptables (${cabinets.length} pages)`)
  push(``)
  for (const c of cabinets) {
    push(`- [${c.title}](${BASE_URL}/expert-comptable/${c.cityKey}/${c.slug})`)
  }
  push(``)

  // ── Résumé ─────────────────────────────────────────────────────
  const total =
    staticPages.length +
    Object.keys(SERVICES).length +
    Object.keys(SECTEURS).length +
    regions.length +
    depts.length +
    allCityRows.length +
    parisRows.length +
    cabinets.length

  lines.unshift(``)
  lines.unshift(`**Total : ${total.toLocaleString('fr-FR')} URLs indexées**`)
  lines.unshift(``)

  const output = lines.join('\n')
  const outPath = path.join(process.cwd(), 'all-urls.md')
  fs.writeFileSync(outPath, output, 'utf-8')
  console.log(`✓ ${total} URLs écrites dans ${outPath}`)

  await prisma.$disconnect()
  await pool.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
