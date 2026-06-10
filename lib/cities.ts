import 'server-only'
import { prisma } from '@/lib/db'
import { haversineKm } from '@/lib/geo'
import { getAllCabinetsForSsg, getAllCabinetsWithRelationsForSsg } from '@/lib/cabinets'
import type { City, Department, Region, CityWithDept, DeptWithRegion } from '@/lib/types'

export type NearbyCityResult = {
  key: string
  name: string
  zip: string
  dptCode: string
  cabinetCount: number
  distanceKm: number
}

// True during `next build` (NODE_ENV=production). False during `next dev`.
const IS_BUILD = process.env.NODE_ENV === 'production'

// ─── Module-level caches (derived from master cabinet query — 0 extra DB calls) ─

// Map cityKey → CityWithDept, built from the full-relations cabinet cache.
// Cities without any (non-deleted) cabinet are absent but irrelevant for SSG.
let _citiesWithDeptPromise: Promise<Map<string, CityWithDept>> | null = null
function getAllCitiesWithDeptForSsg(): Promise<Map<string, CityWithDept>> {
  if (!_citiesWithDeptPromise) {
    _citiesWithDeptPromise = getAllCabinetsWithRelationsForSsg().then((cabinets) => {
      const map = new Map<string, CityWithDept>()
      for (const c of cabinets) {
        if (!map.has(c.cityKey)) map.set(c.cityKey, c.city)
      }
      return map
    })
  }
  return _citiesWithDeptPromise!
}

// ─── Single lookups ───────────────────────────────────────────────

export async function getDeptBySlug(slug: string): Promise<DeptWithRegion | null> {
  if (!IS_BUILD) {
    return prisma.department.findFirst({ where: { slug }, include: { region: true } })
  }
  const all = await getAllDeptsForSsg()
  return all.find((d) => d.slug === slug) ?? null
}

export async function getCity(key: string): Promise<CityWithDept | null> {
  if (!IS_BUILD) {
    return prisma.city.findUnique({
      where: { key },
      include: { department: { include: { region: true } } },
    })
  }
  const map = await getAllCitiesWithDeptForSsg()
  return map.get(key) ?? null
}

export async function getDept(code: string): Promise<DeptWithRegion | null> {
  if (!IS_BUILD) {
    return prisma.department.findFirst({ where: { code }, include: { region: true } })
  }
  const all = await getAllDeptsForSsg()
  return all.find((d) => d.code === code) ?? null
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

// All departments with region, derived from cabinet cache at build time.
// Sorted by name for predictable ordering in dept list pages.
let _allDeptsPromise: Promise<DeptWithRegion[]> | null = null

function getAllDeptsForSsg(): Promise<DeptWithRegion[]> {
  if (!_allDeptsPromise) {
    _allDeptsPromise = getAllCabinetsWithRelationsForSsg().then((cabinets) => {
      const deptMap = new Map<string, DeptWithRegion>()
      for (const c of cabinets) {
        const d = c.city.department
        if (!deptMap.has(d.code)) deptMap.set(d.code, d)
      }
      return Array.from(deptMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    })
  }
  return _allDeptsPromise!
}

export async function getDeptsByRegion(regionCode: string): Promise<Department[]> {
  if (!IS_BUILD) {
    return prisma.department.findMany({ where: { regionCode }, orderBy: { name: 'asc' } })
  }
  const all = await getAllDeptsForSsg()
  return all.filter((d) => d.regionCode === regionCode)
}

// All regions derived from master cabinet cache at build time — consistent with
// getRegionBySlug so generateStaticParams and slug resolution use the same dataset.
let _allRegionsPromise: Promise<Region[]> | null = null

function getAllRegionsForSsg(): Promise<Region[]> {
  if (!_allRegionsPromise) {
    _allRegionsPromise = getAllCabinetsWithRelationsForSsg().then((cabinets) => {
      const regionMap = new Map<string, Region>()
      for (const c of cabinets) {
        const r = c.city.department.region
        if (!regionMap.has(r.code)) regionMap.set(r.code, r)
      }
      return Array.from(regionMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    })
  }
  return _allRegionsPromise!
}

export async function getAllRegions(): Promise<Region[]> {
  if (!IS_BUILD) return prisma.region.findMany({ orderBy: { name: 'asc' } })
  return getAllRegionsForSsg()
}

export async function getAllDepts(): Promise<Department[]> {
  if (!IS_BUILD) return prisma.department.findMany({ orderBy: { name: 'asc' } })
  return getAllDeptsForSsg()
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

// City keys with < 3 cabinets, excluding Paris arrondissements (paris-750xx).
// Used by generateStaticParams for the thin city template (spec 10).
export async function getAllThinCityKeys(): Promise<string[]> {
  const rows = await prisma.city.findMany({
    where: { NOT: { key: { startsWith: 'paris-750' } } },
    select: { key: true, _count: { select: { cabinets: { where: { isDeleted: false } } } } },
  })
  return rows.filter((r) => r._count.cabinets < 3).map((r) => r.key)
}

// City keys with ≥3 cabinets, excluding Paris arrondissements (paris-750xx).
// paris-75 (global) does NOT start with 'paris-750' and is intentionally included.
export async function getAllNormalCityKeys(): Promise<string[]> {
  const rows = await prisma.city.findMany({
    where: { NOT: { key: { startsWith: 'paris-750' } } },
    select: { key: true, _count: { select: { cabinets: { where: { isDeleted: false } } } } },
  })
  return rows.filter((r) => r._count.cabinets >= 3).map((r) => r.key)
}

// At build time: derived from master cabinet cache — 0 extra DB queries.
// In dev: Promise-keyed cache, ≤95 DB queries per worker (one per unique dept).
const _citiesByDeptCache = new Map<
  string,
  Promise<{ key: string; name: string; zip: string; cabinetCount: number }[]>
>()

export function getCitiesByDeptWithCount(
  dptCode: string,
): Promise<{ key: string; name: string; zip: string; cabinetCount: number }[]> {
  if (IS_BUILD) {
    if (!_citiesByDeptCache.has(dptCode)) {
      _citiesByDeptCache.set(
        dptCode,
        getAllCabinetsWithRelationsForSsg().then((cabinets) => {
          const cityMap = new Map<string, { key: string; name: string; zip: string; count: number }>()
          for (const c of cabinets) {
            if (c.city.dptCode !== dptCode) continue
            const entry = cityMap.get(c.cityKey)
            if (entry) {
              entry.count++
            } else {
              cityMap.set(c.cityKey, { key: c.cityKey, name: c.city.name, zip: c.city.zip, count: 1 })
            }
          }
          return [...cityMap.values()]
            .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
            .map(({ key, name, zip, count }) => ({ key, name, zip, cabinetCount: count }))
        }),
      )
    }
    return _citiesByDeptCache.get(dptCode)!
  }

  if (!_citiesByDeptCache.has(dptCode)) {
    _citiesByDeptCache.set(
      dptCode,
      prisma.city
        .findMany({
          where: { dptCode },
          select: {
            key: true,
            name: true,
            zip: true,
            _count: { select: { cabinets: { where: { isDeleted: false } } } },
          },
          orderBy: { name: 'asc' },
        })
        .then((rows) =>
          rows.map((r) => ({
            key: r.key,
            name: r.name,
            zip: r.zip,
            cabinetCount: r._count.cabinets,
          })),
        ),
    )
  }
  return _citiesByDeptCache.get(dptCode)!
}

// At build time: uses the SSG cabinet cache for in-memory haversine — eliminates
// ~1 964 DB queries per worker. In dev: 2 targeted DB queries (bounding-box +
// centroid) to avoid the master cache cold-start.
export async function getNearbyNormalCities(
  cityKey: string,
  limit = 5,
): Promise<NearbyCityResult[]> {
  if (!IS_BUILD) {
    const ownCabs = await prisma.cabinet.findMany({
      where: { cityKey, isDeleted: false },
      select: { latitude: true, longitude: true },
    })
    if (ownCabs.length === 0) return []
    const centLat = ownCabs.reduce((s, c) => s + c.latitude, 0) / ownCabs.length
    const centLon = ownCabs.reduce((s, c) => s + c.longitude, 0) / ownCabs.length
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
        city: { select: { name: true, zip: true, dptCode: true } },
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

  const all = await getAllCabinetsForSsg()
  const own = all.filter((c) => c.cityKey === cityKey)
  if (own.length === 0) return []

  const centLat = own.reduce((s, c) => s + c.latitude, 0) / own.length
  const centLon = own.reduce((s, c) => s + c.longitude, 0) / own.length
  const radiusKm = 50

  const cityMap = new Map<
    string,
    { name: string; zip: string; dptCode: string; count: number; minDist: number }
  >()
  for (const c of all) {
    if (c.cityKey === cityKey) continue
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

// ─── Region lookups ───────────────────────────────────────────────

export async function getRegionBySlug(slug: string): Promise<Region | null> {
  if (!IS_BUILD) {
    return prisma.region.findFirst({ where: { slug } })
  }
  const master = await getAllCabinetsWithRelationsForSsg()
  const found = master.find((c) => c.city.department.region.slug === slug)
  return found?.city.department.region ?? null
}

export async function getTopCitiesByRegion(
  regionCode: string,
  limit = 12,
): Promise<{ key: string; name: string; zip: string; cabinetCount: number }[]> {
  if (IS_BUILD) {
    const master = await getAllCabinetsWithRelationsForSsg()
    const byCity = new Map<string, { key: string; name: string; zip: string; count: number }>()
    for (const c of master) {
      if (c.city.department.region.code !== regionCode) continue
      const entry = byCity.get(c.cityKey)
      if (entry) {
        entry.count++
      } else {
        byCity.set(c.cityKey, { key: c.cityKey, name: c.city.name, zip: c.city.zip, count: 1 })
      }
    }
    return [...byCity.values()]
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'fr'))
      .slice(0, limit)
      .map(({ key, name, zip, count }) => ({ key, name, zip, cabinetCount: count }))
  }

  const depts = await getDeptsByRegion(regionCode)
  const allCities: { key: string; name: string; zip: string; cabinetCount: number }[] = []
  for (const d of depts) {
    const cities = await getCitiesByDeptWithCount(d.code)
    allCities.push(...cities)
  }
  return allCities
    .sort((a, b) => b.cabinetCount - a.cabinetCount || a.name.localeCompare(b.name, 'fr'))
    .slice(0, limit)
}

// ─── Counts ───────────────────────────────────────────────────────

export async function getParisArrondissementsWithCount(): Promise<
  { key: string; zip: string; cabinetCount: number }[]
> {
  if (IS_BUILD) {
    const master = await getAllCabinetsWithRelationsForSsg()
    const byArr = new Map<string, { key: string; zip: string; count: number }>()
    for (const c of master) {
      if (!c.cityKey.startsWith('paris-750')) continue
      const entry = byArr.get(c.cityKey)
      if (entry) {
        entry.count++
      } else {
        byArr.set(c.cityKey, { key: c.cityKey, zip: c.city.zip, count: 1 })
      }
    }
    return [...byArr.values()]
      .sort((a, b) => a.zip.localeCompare(b.zip))
      .map(({ key, zip, count }) => ({ key, zip, cabinetCount: count }))
  }
  // Dev: targeted queries, 20 rows
  const keys = await getAllParisArrKeys()
  const results = await Promise.all(
    keys.map(async (key) => {
      const city = await prisma.city.findUnique({
        where: { key },
        select: { zip: true, _count: { select: { cabinets: { where: { isDeleted: false } } } } },
      })
      return { key, zip: city?.zip ?? '', cabinetCount: city?._count?.cabinets ?? 0 }
    }),
  )
  return results.sort((a, b) => a.zip.localeCompare(b.zip))
}

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
