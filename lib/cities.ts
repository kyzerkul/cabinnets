import 'server-only'
import { prisma } from '@/lib/db'
import type { City, Department, Region, CityWithDept, DeptWithRegion } from '@/lib/types'

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
    .sort((a, b) => b.cabinetCount - a.cabinetCount)
    .slice(0, limit)
}
