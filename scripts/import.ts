import * as fs from 'fs'
import * as path from 'path'
import { PrismaClient, Prisma } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// ─── Setup ───────────────────────────────────────────────────────────────────

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ─── Types ───────────────────────────────────────────────────────────────────

interface RawCabinet {
  place_id: string
  feature_id: string | null
  title: string
  cabinet_slug: string
  city: string
  ville_slug: string
  ville_key: string
  zip: string
  dpt: string
  dpt_name: string
  dpt_slug: string
  region_code: string
  region_name: string
  region_slug: string
  street: string | null
  address: string
  latitude: number
  longitude: number
  phone_e164: string | null
  phone_display: string | null
  url: string | null
  rating_value: number | null
  rating_count: number | null
  work_hours: unknown
  attributes: unknown[]
  people_also_search: unknown[]
  place_topics: Record<string, number>
  description: string | null
  description_source: string | null
  siren: string | null
  siret: string | null
  forme_juridique_code: string | null
  forme_juridique_label: string | null
  naf_code: string | null
  date_creation: string | null
  tranche_effectif_code: string | null
  tranche_effectif_label: string | null
  sirene_confidence: string | null
  services: string[]
  secteurs: string[]
  langues_etrangeres: string[]
  presence_digitale: boolean
  image_logo_path: string | null
  image_main_path: string | null
  image_logo_quality: string | null
  image_main_quality: string | null
}

// ─── Load + sanitise ─────────────────────────────────────────────────────────

function loadData(): RawCabinet[] {
  // script lives in annuaire/scripts/ → data is at ../../data/ (project root)
  const filePath = path.join(__dirname, '..', '..', 'data', 'cabinets-enriched.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  // Python json.dump emits bare NaN for float('nan') — invalid JSON, replace before parse
  const sanitised = raw.replace(/\bNaN\b/g, 'null')
  return JSON.parse(sanitised) as RawCabinet[]
}

// ─── Slug deduplication ───────────────────────────────────────────────────────

function deduplicateSlugs(records: RawCabinet[]): Map<string, string> {
  // Uses a used-set rather than a counter so that base slugs ending in "-N"
  // (e.g. "cerfrance-alliance-comtoise-agc-2") don't collide with generated suffixes.
  const used = new Set<string>()
  const result = new Map<string, string>()

  for (const r of records) {
    const base = r.cabinet_slug
    let candidate = base
    let n = 2
    while (used.has(candidate)) {
      candidate = `${base}-${n}`
      n++
    }
    used.add(candidate)
    result.set(r.place_id, candidate)
  }

  return result
}

// ─── Import ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('Loading data/cabinets-enriched.json…')
  const records = loadData()
  console.log(`  ${records.length} records loaded`)

  // Skip records with invalid geo (region_code null or dpt "00" / null)
  const valid = records.filter(r => r.region_code != null && r.dpt != null && r.dpt !== '00')
  const skipped = records.length - valid.length
  if (skipped > 0) console.log(`  ${skipped} records skipped (invalid geo fields)`)

  const slugMap = deduplicateSlugs(valid)
  const dupeCount = valid.filter(r => slugMap.get(r.place_id) !== r.cabinet_slug).length
  if (dupeCount > 0) console.log(`  ${dupeCount} slug duplicates resolved`)

  // ── 1. Regions ──────────────────────────────────────────────────────────────
  console.log('\nUpserting regions…')
  const regionMap = new Map<string, { name: string; slug: string }>()
  for (const r of valid) {
    if (!regionMap.has(r.region_code)) {
      regionMap.set(r.region_code, { name: r.region_name, slug: r.region_slug })
    }
  }

  let count = 0
  for (const [code, { name, slug }] of regionMap) {
    await prisma.region.upsert({
      where: { code },
      update: { name, slug },
      create: { code, name, slug },
    })
    count++
  }
  console.log(`  ${count} regions upserted`)

  // ── 2. Departments ──────────────────────────────────────────────────────────
  console.log('\nUpserting departments…')
  const dptMap = new Map<string, { name: string; slug: string; regionCode: string }>()
  for (const r of valid) {
    if (!dptMap.has(r.dpt)) {
      dptMap.set(r.dpt, { name: r.dpt_name, slug: r.dpt_slug, regionCode: r.region_code })
    }
  }

  count = 0
  for (const [code, { name, slug, regionCode }] of dptMap) {
    await prisma.department.upsert({
      where: { code },
      update: { name, slug, regionCode },
      create: { code, name, slug, regionCode },
    })
    count++
  }
  console.log(`  ${count} departments upserted`)

  // ── 3. Cities ────────────────────────────────────────────────────────────────
  console.log('\nUpserting cities…')
  const cityMap = new Map<string, { name: string; slug: string; zip: string; dptCode: string }>()
  for (const r of valid) {
    if (!cityMap.has(r.ville_key)) {
      cityMap.set(r.ville_key, {
        name: r.city,
        slug: r.ville_slug,
        zip: r.zip,
        dptCode: r.dpt,
      })
    }
  }

  count = 0
  for (const [key, { name, slug, zip, dptCode }] of cityMap) {
    await prisma.city.upsert({
      where: { key },
      update: { name, slug, zip, dptCode },
      create: { key, name, slug, zip, dptCode },
    })
    count++
  }
  console.log(`  ${count} cities upserted`)

  // ── 4. Cabinets ──────────────────────────────────────────────────────────────
  // Full truncate + batch insert: avoids slug unique-constraint conflicts from
  // partial previous runs. Safe because source JSON is the single source of truth.
  console.log('\nTruncating cabinets…')
  await prisma.cabinet.deleteMany({})

  console.log('Inserting cabinets in batches…')
  const rows = valid.map(r => ({
    placeId: r.place_id,
    featureId: r.feature_id,
    title: r.title,
    slug: slugMap.get(r.place_id)!,
    cityKey: r.ville_key,
    zip: r.zip,
    street: r.street,
    address: r.address,
    latitude: r.latitude,
    longitude: r.longitude,
    phoneE164: r.phone_e164,
    phoneDisplay: r.phone_display,
    url: r.url,
    ratingValue: r.rating_value,
    ratingCount: r.rating_count,
    workHours: r.work_hours != null ? r.work_hours as Prisma.InputJsonValue : undefined,
    attributes: (r.attributes ?? []) as Prisma.InputJsonValue,
    peopleAlsoSearch: (r.people_also_search ?? []) as Prisma.InputJsonValue,
    placeTopics: (r.place_topics ?? {}) as Prisma.InputJsonValue,
    description: r.description,
    descriptionSource: r.description_source,
    siren: r.siren,
    siret: r.siret,
    formeJuridiqueCode: r.forme_juridique_code,
    formeJuridiqueLabel: r.forme_juridique_label,
    nafCode: r.naf_code,
    dateCreation: r.date_creation,
    trancheEffectifCode: r.tranche_effectif_code,
    trancheEffectifLabel: r.tranche_effectif_label,
    sireneConfidence: r.sirene_confidence,
    services: r.services ?? [],
    secteurs: r.secteurs ?? [],
    languesEtrangeres: r.langues_etrangeres ?? [],
    presenceDigitale: r.presence_digitale ?? false,
    imageLogoPath: r.image_logo_path,
    imageMainPath: r.image_main_path,
    imageLogoQuality: r.image_logo_quality,
    imageMainQuality: r.image_main_quality,
  }))

  const BATCH = 200
  for (let i = 0; i < rows.length; i += BATCH) {
    await prisma.cabinet.createMany({ data: rows.slice(i, i + BATCH) })
    process.stdout.write(`\r  ${Math.min(i + BATCH, rows.length)}/${rows.length}…`)
  }
  console.log(`\r  ${rows.length} cabinets inserted    `)

  // ── 5. Summary ───────────────────────────────────────────────────────────────
  const [rCount, dCount, cCount, caCount] = await Promise.all([
    prisma.region.count(),
    prisma.department.count(),
    prisma.city.count(),
    prisma.cabinet.count(),
  ])
  console.log('\n✅ Import complete:')
  console.log(`   Regions:     ${rCount}`)
  console.log(`   Departments: ${dCount}`)
  console.log(`   Cities:      ${cCount}`)
  console.log(`   Cabinets:    ${caCount}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
