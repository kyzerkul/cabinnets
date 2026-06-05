import 'server-only'
import { prisma } from '@/lib/db'
import { haversineKm } from '@/lib/geo'
import type { CabinetWithCity, CabinetWithRelations } from '@/lib/types'

type PasItem = { feature_id?: string }

const SORT = [
  { featured: 'desc' as const },
  { ratingValue: { sort: 'desc' as const, nulls: 'last' as const } },
  { ratingCount: { sort: 'desc' as const, nulls: 'last' as const } },
]

// ─── Single cabinet ───────────────────────────────────────────────

export async function getCabinet(slug: string): Promise<CabinetWithRelations | null> {
  return prisma.cabinet.findFirst({
    where: { slug, isDeleted: false },
    include: {
      city: { include: { department: { include: { region: true } } } },
    },
  })
}

// ─── By city ──────────────────────────────────────────────────────

export async function getCabinetsByCity(cityKey: string): Promise<CabinetWithCity[]> {
  return prisma.cabinet.findMany({
    where: { cityKey, isDeleted: false },
    include: { city: true },
    orderBy: SORT,
  })
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
): Promise<CabinetWithCity[]> {
  return prisma.cabinet.findMany({
    where: { city: { dptCode }, isDeleted: false },
    include: { city: true },
    orderBy: SORT,
    ...(limit !== undefined ? { take: limit } : {}),
  })
}

export async function getCabinetsByRegion(
  regionCode: string,
  limit?: number,
): Promise<CabinetWithCity[]> {
  return prisma.cabinet.findMany({
    where: { city: { department: { regionCode } }, isDeleted: false },
    include: { city: true },
    orderBy: SORT,
    ...(limit !== undefined ? { take: limit } : {}),
  })
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
  return prisma.cabinet.count({ where: { cityKey, isDeleted: false } })
}

export async function countCabinetsByDept(dptCode: string): Promise<number> {
  return prisma.cabinet.count({ where: { city: { dptCode }, isDeleted: false } })
}

export async function countCabinetsByRegion(regionCode: string): Promise<number> {
  return prisma.cabinet.count({
    where: { city: { department: { regionCode } }, isDeleted: false },
  })
}

export async function getTotalCabinetCount(): Promise<number> {
  return prisma.cabinet.count({ where: { isDeleted: false } })
}

// ─── Fiche relations ──────────────────────────────────────────────

// Up to `limit` cabinets in the same city, excluding the current one.
export async function getCabinetsProches(
  cabinet: Pick<CabinetWithRelations, 'slug' | 'cityKey'>,
  limit = 6,
): Promise<CabinetWithCity[]> {
  return prisma.cabinet.findMany({
    where: { cityKey: cabinet.cityKey, slug: { not: cabinet.slug }, isDeleted: false },
    include: { city: true },
    orderBy: SORT,
    take: limit,
  })
}

// Matches featureIds from peopleAlsoSearch JSON against our cabinets.
export async function getPeopleAlsoSearchCabinets(
  cabinet: Pick<CabinetWithRelations, 'peopleAlsoSearch'>,
  limit = 5,
): Promise<CabinetWithCity[]> {
  const pas = cabinet.peopleAlsoSearch
  if (!Array.isArray(pas) || pas.length === 0) return []

  const featureIds = (pas as PasItem[])
    .map((p) => p.feature_id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0)

  if (featureIds.length === 0) return []

  return prisma.cabinet.findMany({
    where: { featureId: { in: featureIds }, isDeleted: false },
    include: { city: true },
    take: limit,
  })
}
