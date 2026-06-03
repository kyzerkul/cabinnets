import { defineConfig } from 'prisma/config'

// Prisma 7: datasource URL is declared here (not in schema.prisma).
// The DATABASE_URL env var is loaded from .env by the Prisma CLI automatically,
// or set in the shell before running prisma commands (see package.json db:* scripts).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
