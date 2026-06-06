import 'server-only'
import { prisma } from '@/lib/db'
import { haversineKm } from '@/lib/geo'
import type { CabinetForCard, CabinetSsgEntry, CabinetWithCity, CabinetWithRelations } from '@/lib/types'

type PasItem = { feature_id?: string }

const SORT = [
  { featured: 'desc' as const },
  { ratingValue: { sort: 'desc' as const, nulls: 'last' as const } },
  { ratingCount: { sort: 'desc' as const, nulls: 'last' as const } },
]

// True during `next build` (NODE_ENV=production). False during `next dev`.
// In dev, skip the master cache and use targeted Prisma queries to avoid the
// 60-120s Neon cold-start penalty on the first page request.
const IS_BUILD = process.env.NODE_ENV === 'production'

// ─── Master SSG cache ─────────────────────────────────────────────
// ONE query per worker at build time. Loads all 1 996 cabinets with full
// city+dept+region. All in-memory helpers derive from this single Promise.
// Exported so cities.ts can derive its city/dept/region maps from the same data.

let _allWithRelationsPromise: Promise<CabinetWithRelations[]> | null = null

export function getAllCabinetsWithRelationsForSsg(): Promise<CabinetWithRelations[]> {
  if (!_allWithRelationsPromise) {
    _allWithRelationsPromise = prisma.cabinet.findMany({
      where: { isDeleted: false },
      include: { city: { include: { department: { include: { region: true } } } } },
      orderBy: SORT,
    })
  }
  return _allWithRelationsPromise
}

// ─── Single cabinet ───────────────────────────────────────────────

export async function getCabinet(slug: string): Promise<CabinetWithRelations | null> {
  if (!IS_BUILD) {
    return prisma.cabinet.findFirst({
      where: { slug, isDeleted: false },
      include: { city: { include: { department: { include: { region: true } } } } },
    })
  }
  const all = await getAllCabinetsWithRelationsForSsg()
  return all.find((c) => c.slug === slug) ?? null
}

// ─── By city ──────────────────────────────────────────────────────

export async function getCabinetsByCity(cityKey: string): Promise<CabinetForCard[]> {
  if (!IS_BUILD) {
    const rows = await prisma.cabinet.findMany({
      where: { cityKey, isDeleted: false },
      include: { city: true },
      orderBy: SORT,
    })
    return rows as unknown as CabinetForCard[]
  }
  const all = await getAllCabinetsForSsg()
  return all.filter((c) => c.cityKey === cityKey)
}

// Returns cabinets within `radiusKm` of the thin city's centroid,
// excluding cabinets belonging to `cityKey` itself.
// Centroid is derived from the city's own cabinets (average lat/lon).
export async function getCabinetsNearCity(
  cityKey: string,
  radiusKm = 20,
): Promise<(CabinetWithCity & { distanceKm: number })[]> {
  const ownCabinets = await prisma.cabinet.findMany({
    where: { cityKey, isDeleted: false },
    select: { latitude: true, longitude: true },
  })
  if (ownCabinets.length === 0) return []

  const centLat = ownCabinets.reduce((s, c) => s + c.latitude, 0) / ownCabinets.length
  const centLon = ownCabinets.reduce((s, c) => s + c.longitude, 0) / ownCabinets.length

  // Bounding-box pre-filter reduces DB rows before haversine computation.
  // 1° lat ≈ 111 km; 1° lon ≈ 111 km × cos(lat).
  const latRange = radiusKm / 111
  const lonRange = radiusKm / (111 * Math.cos((centLat * Math.PI) / 180))

  const all = await prisma.cabinet.findMany({
    where: {
      isDeleted: false,
      NOT: { cityKey },
      latitude: { gte: centLat - latRange, lte: centLat + latRange },
      longitude: { gte: centLon - lonRange, lte: centLon + lonRange },
    },
    include: { city: true },
    orderBy: SORT,
  })

  return all
    .map((c) => ({ ...c, distanceKm: haversineKm(centLat, centLon, c.latitude, c.longitude) }))
    .filter((c) => c.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
}

// ─── By dept / region ─────────────────────────────────────────────

export async function getCabinetsByDept(
  dptCode: string,
  limit?: number,
): Promise<CabinetForCard[]> {
  if (!IS_BUILD) {
    const rows = await prisma.cabinet.findMany({
      where: { city: { dptCode }, isDeleted: false },
      include: { city: true },
      orderBy: SORT,
      ...(limit !== undefined ? { take: limit } : {}),
    })
    return rows as unknown as CabinetForCard[]
  }
  const all = await getAllCabinetsWithRelationsForSsg()
  const filtered = all.filter((c) => c.city.dptCode === dptCode)
  return limit !== undefined ? filtered.slice(0, limit) : filtered
}

export async function getCabinetsByRegion(
  regionCode: string,
  limit?: number,
): Promise<CabinetForCard[]> {
  if (!IS_BUILD) {
    const rows = await prisma.cabinet.findMany({
      where: { city: { department: { regionCode } }, isDeleted: false },
      include: { city: true },
      orderBy: SORT,
      ...(limit !== undefined ? { take: limit } : {}),
    })
    return rows as unknown as CabinetForCard[]
  }
  const all = await getAllCabinetsWithRelationsForSsg()
  const filtered = all.filter((c) => c.city.department.regionCode === regionCode)
  return limit !== undefined ? filtered.slice(0, limit) : filtered
}

// ─── generateStaticParams data ────────────────────────────────────

export async function getAllCabinetSlugs(): Promise<{ slug: string; cityKey: string }[]> {
  return prisma.cabinet.findMany({
    where: { isDeleted: false },
    select: { slug: true, cityKey: true },
  })
}

// ─── Counts ───────────────────────────────────────────────────────

export async function countCabinetsByCity(cityKey: string): Promise<number> {
  if (!IS_BUILD) return prisma.cabinet.count({ where: { cityKey, isDeleted: false } })
  const all = await getAllCabinetsForSsg()
  return all.filter((c) => c.cityKey === cityKey).length
}

export async function countCabinetsByDept(dptCode: string): Promise<number> {
  if (!IS_BUILD) return prisma.cabinet.count({ where: { city: { dptCode }, isDeleted: false } })
  const all = await getAllCabinetsForSsg()
  return all.filter((c) => c.city.dptCode === dptCode).length
}

export async function countCabinetsByRegion(regionCode: string): Promise<number> {
  if (!IS_BUILD) {
    return prisma.cabinet.count({ where: { city: { department: { regionCode } }, isDeleted: false } })
  }
  const all = await getAllCabinetsWithRelationsForSsg()
  return all.filter((c) => c.city.department.regionCode === regionCode).length
}

export async function getTotalCabinetCount(): Promise<number> {
  return prisma.cabinet.count({ where: { isDeleted: false } })
}

// Thin wrapper so callers typed against CabinetSsgEntry continue to compile.
// CabinetWithRelations is a structural superset of CabinetSsgEntry; the cast
// is safe at runtime. Shares the master Promise — no second DB query.
export function getAllCabinetsForSsg(): Promise<CabinetSsgEntry[]> {
  return getAllCabinetsWithRelationsForSsg() as unknown as Promise<CabinetSsgEntry[]>
}

// In-memory variant for thin-city pages: uses the SSG cache to avoid 2 DB
// queries per page at build time. In dev, delegates to getCabinetsNearCity
// (2 targeted queries) to avoid the master cache cold-start penalty.
export async function getCabinetsNearCityFast(
  cityKey: string,
  radiusKm = 20,
): Promise<(CabinetForCard & { distanceKm: number })[]> {
  if (!IS_BUILD) {
    const result = await getCabinetsNearCity(cityKey, radiusKm)
    return result as unknown as (CabinetForCard & { distanceKm: number })[]
  }
  const all = await getAllCabinetsForSsg()
  const own = all.filter((c) => c.cityKey === cityKey)
  if (own.length === 0) return []

  const centLat = own.reduce((s, c) => s + c.latitude, 0) / own.length
  const centLon = own.reduce((s, c) => s + c.longitude, 0) / own.length

  return all
    .filter((c) => c.cityKey !== cityKey)
    .map((c) => ({ ...c, distanceKm: haversineKm(centLat, centLon, c.latitude, c.longitude) }))
    .filter((c) => c.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
}

// ─── Fiche relations ──────────────────────────────────────────────

export async function getCabinetsProches(
  cabinet: Pick<CabinetWithRelations, 'slug' | 'cityKey'>,
  limit = 6,
): Promise<CabinetForCard[]> {
  if (!IS_BUILD) {
    const rows = await prisma.cabinet.findMany({
      where: { cityKey: cabinet.cityKey, slug: { not: cabinet.slug }, isDeleted: false },
      include: { city: true },
      orderBy: SORT,
      take: limit,
    })
    return rows as unknown as CabinetForCard[]
  }
  const all = await getAllCabinetsForSsg()
  return all
    .filter((c) => c.cityKey === cabinet.cityKey && c.slug !== cabinet.slug)
    .slice(0, limit)
}

export async function getPeopleAlsoSearchCabinets(
  cabinet: Pick<CabinetWithRelations, 'peopleAlsoSearch'>,
  limit = 5,
): Promise<CabinetForCard[]> {
  const pas = cabinet.peopleAlsoSearch
  if (!Array.isArray(pas) || pas.length === 0) return []

  const featureIds = new Set(
    (pas as PasItem[])
      .map((p) => p.feature_id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0),
  )
  if (featureIds.size === 0) return []

  if (!IS_BUILD) {
    const rows = await prisma.cabinet.findMany({
      where: { featureId: { in: [...featureIds] }, isDeleted: false },
      include: { city: true },
      orderBy: SORT,
      take: limit,
    })
    return rows as unknown as CabinetForCard[]
  }
  const all = await getAllCabinetsForSsg()
  return all.filter((c) => c.featureId !== null && featureIds.has(c.featureId)).slice(0, limit)
}
