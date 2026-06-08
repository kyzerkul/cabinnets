-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('PENDING', 'SENT', 'ARCHIVED');

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "LeadStatus" NOT NULL DEFAULT 'PENDING',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "message" TEXT NOT NULL,
    "cabinetId" TEXT,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_cabinetId_fkey" FOREIGN KEY ("cabinetId") REFERENCES "Cabinet"("placeId") ON DELETE SET NULL ON UPDATE CASCADE;
