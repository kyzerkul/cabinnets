import 'server-only'
import { prisma } from '@/lib/db'
import { haversineKm } from '@/lib/geo'
import type { City, Department, Region, CityWithDept, DeptWithRegion } from '@/lib/types'

export type NearbyCityResult = {
  key: string
  name: string
  zip: string
  dptCode: string
  cabinetCount: number
  distanceKm: number
}

// ─── Single lookups ───────────────────────────────────────────────

export async function getCity(key: string): Promise<CityWithDept | null> {
  return prisma.city.findUnique({
    where: { key },
    include: { department: { include: { region: true } } },
  })
}

export async function getDept(code: string): Promise<DeptWithRegion | null> {
  return prisma.department.findUnique({
    where: { code },
    include: { region: true },
  })
}

export async function getRegion(code: string): Promise<Region | null> {
  return prisma.region.findUnique({ where: { code } })
}

// ─── Lists ────────────────────────────────────────────────────────

export async function getCitiesByDept(dptCode: string): Promise<City[]> {
  return prisma.city.findMany({
    where: { dptCode },
    orderBy: { name: 'asc' },
  })
}

export async function getDeptsByRegion(regionCode: string): Promise<Department[]> {
  return prisma.department.findMany({
    where: { regionCode },
    orderBy: { name: 'asc' },
  })
}

export async function getAllRegions(): Promise<Region[]> {
  return prisma.region.findMany({ orderBy: { name: 'asc' } })
}

export async function getAllDepts(): Promise<Department[]> {
  return prisma.department.findMany({ orderBy: { name: 'asc' } })
}

// ─── generateStaticParams data ────────────────────────────────────

export async function getAllCityKeys(): Promise<string[]> {
  const rows = await prisma.city.findMany({ select: { key: true } })
  return rows.map((r) => r.key)
}

export async function getAllDeptCodes(): Promise<string[]> {
  const rows = await prisma.department.findMany({ select: { code: true } })
  return rows.map((r) => r.code)
}

export async function getAllRegionCodes(): Promise<string[]> {
  const rows = await prisma.region.findMany({ select: { code: true } })
  return rows.map((r) => r.code)
}

// Paris arrondissement keys only: "paris-75001" … "paris-75020".
export async function getAllParisArrKeys(): Promise<string[]> {
  const rows = await prisma.city.findMany({
    where: { key: { startsWith: 'paris-750' } },
    select: { key: true },
  })
  return rows.map((r) => r.key)
}

// ─── Spec 09 helpers ──────────────────────────────────────────────

// City keys with ≥3 cabinets, excluding Paris arrondissements (paris-750xx).
// paris-75 (global) does NOT start with 'paris-750' and is intentionally included.
export async function getAllNormalCityKeys(): Promise<string[]> {
  const rows = await prisma.city.findMany({
    where: { NOT: { key: { startsWith: 'paris-750' } } },
    select: { key: true, _count: { select: { cabinets: true } } },
  })
  return rows.filter((r) => r._count.cabinets >= 3).map((r) => r.key)
}

export async function getCitiesByDeptWithCount(
  dptCode: string,
): Promise<{ key: string; name: string; zip: string; cabinetCount: number }[]> {
  const rows = await prisma.city.findMany({
    where: { dptCode },
    select: { key: true, name: true, zip: true, _count: { select: { cabinets: true } } },
    orderBy: { name: 'asc' },
  })
  return rows.map((r) => ({
    key: r.key,
    name: r.name,
    zip: r.zip,
    cabinetCount: r._count.cabinets,
  }))
}

// Top `limit` distinct cities (≠ cityKey) whose cabinets fall within 50 km of
// the current city's centroid (computed from its own cabinet coordinates).
export async function getNearbyNormalCities(
  cityKey: string,
  limit = 5,
): Promise<NearbyCityResult[]> {
  const ownCabinets = await prisma.cabinet.findMany({
    where: { cityKey, isDeleted: false },
    select: { latitude: true, longitude: true },
  })
  if (ownCabinets.length === 0) return []

  const centLat = ownCabinets.reduce((s, c) => s + c.latitude, 0) / ownCabinets.length
  const centLon = ownCabinets.reduce((s, c) => s + c.longitude, 0) / ownCabinets.length

  const radiusKm = 50
  const latRange = radiusKm / 111
  const lonRange = radiusKm / (111 * Math.cos((centLat * Math.PI) / 180))

  const nearby = await prisma.cabinet.findMany({
    where: {
      isDeleted: false,
      NOT: { cityKey },
      latitude: { gte: centLat - latRange, lte: centLat + latRange },
      longitude: { gte: centLon - lonRange, lte: centLon + lonRange },
    },
    select: {
      cityKey: true,
      latitude: true,
      longitude: true,
      city: { select: { key: true, name: true, zip: true, dptCode: true } },
    },
  })

  const cityMap = new Map<
    string,
    { name: string; zip: string; dptCode: string; count: number; minDist: number }
  >()
  for (const c of nearby) {
    const dist = haversineKm(centLat, centLon, c.latitude, c.longitude)
    if (dist > radiusKm) continue
    const entry = cityMap.get(c.cityKey)
    if (!entry) {
      cityMap.set(c.cityKey, {
        name: c.city.name,
        zip: c.city.zip,
        dptCode: c.city.dptCode,
        count: 1,
        minDist: dist,
      })
    } else {
      entry.count++
      entry.minDist = Math.min(entry.minDist, dist)
    }
  }

  return Array.from(cityMap.entries())
    .map(([key, v]) => ({
      key,
      name: v.name,
      zip: v.zip,
      dptCode: v.dptCode,
      cabinetCount: v.count,
      distanceKm: v.minDist,
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
}

// ─── Counts ───────────────────────────────────────────────────────

export async function countCitiesByDept(dptCode: string): Promise<number> {
  return prisma.city.count({ where: { dptCode } })
}

export async function getDeptCount(): Promise<number> {
  return prisma.department.count()
}

// Counts cities excluding Paris arrondissements (paris-75001…75020).
// paris-75 (global) does NOT start with 'paris-750' and is included.
export async function getCityCount(): Promise<number> {
  return prisma.city.count({
    where: { NOT: { key: { startsWith: 'paris-750' } } },
  })
}

export async function getTopCitiesByCabinetCount(
  limit: number,
): Promise<{ key: string; name: string; zip: string; dptCode: string; cabinetCount: number }[]> {
  const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.trunc(limit)) : 0
  if (safeLimit === 0) return []

  // orderBy relation _count is not supported by Prisma 7 types — sort in JS instead.
  const rows = await prisma.city.findMany({
    where: { NOT: { key: { startsWith: 'paris-750' } } },
    select: {
      key: true,
      name: true,
      zip: true,
      dptCode: true,
      _count: { select: { cabinets: true } },
    },
  })
  return rows
    .map((r) => ({
      key: r.key,
      name: r.name,
      zip: r.zip,
      dptCode: r.dptCode,
      cabinetCount: r._count.cabinets,
    }))
    .sort((a, b) => b.cabinetCount - a.cabinetCount || a.name.localeCompare(b.name, 'fr'))
    .slice(0, safeLimit)
}
