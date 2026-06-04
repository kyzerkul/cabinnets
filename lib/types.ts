import { type Prisma } from '@prisma/client'

export type { Cabinet, City, Department, Region } from '@prisma/client'

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
