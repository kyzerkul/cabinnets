import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

function createPrismaClient() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  // max:1 avoids connection pool exhaustion across the 7 SSG build workers (each process gets its own pool)
  const pool = new Pool({ connectionString: url, max: 1, idleTimeoutMillis: 10000 })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
