import { type Prisma } from '@prisma/client'

export type { Cabinet, City, Department, Region } from '@prisma/client'

// Minimal cabinet shape needed to render a CabinetCard.
// CabinetWithCity structurally satisfies this type (it has all these fields plus more).
export type CabinetForCard = Prisma.CabinetGetPayload<{
  select: {
    placeId: true
    title: true
    slug: true
    cityKey: true
    imageLogoPath: true
    imageLogoQuality: true
    ratingValue: true
    ratingCount: true
    description: true
    featured: true
    city: { select: { key: true; name: true; zip: true } }
  }
}>

// CabinetForCard + lat/lon + city.dptCode for in-memory geo computation in the SSG cabinet cache.
export type CabinetSsgEntry = Prisma.CabinetGetPayload<{
  select: {
    placeId: true
    title: true
    slug: true
    cityKey: true
    latitude: true
    longitude: true
    imageLogoPath: true
    imageLogoQuality: true
    ratingValue: true
    ratingCount: true
    description: true
    featured: true
    city: { select: { key: true; name: true; zip: true; dptCode: true } }
    featureId: true
  }
}>

export type CabinetWithRelations = Prisma.CabinetGetPayload<{
  include: {
    city: {
      include: {
        department: { include: { region: true } }
      }
    }
  }
}>

export type CabinetWithCity = Prisma.CabinetGetPayload<{
  include: { city: true }
}>

export type CityWithDept = Prisma.CityGetPayload<{
  include: { department: { include: { region: true } } }
}>

export type DeptWithRegion = Prisma.DepartmentGetPayload<{
  include: { region: true }
}>
