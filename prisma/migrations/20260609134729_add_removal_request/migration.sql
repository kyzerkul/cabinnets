-- CreateEnum
CREATE TYPE "RemovalStatus" AS ENUM ('PENDING', 'PROCESSED', 'REJECTED');

-- CreateTable
CREATE TABLE "removal_requests" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RemovalStatus" NOT NULL DEFAULT 'PENDING',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cabinetName" TEXT NOT NULL,
    "address" TEXT,
    "reason" TEXT NOT NULL,

    CONSTRAINT "removal_requests_pkey" PRIMARY KEY ("id")
);
