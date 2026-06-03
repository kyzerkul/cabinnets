-- CreateTable
CREATE TABLE "Region" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Department" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "regionCode" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "City" (
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "dptCode" TEXT NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Cabinet" (
    "placeId" TEXT NOT NULL,
    "featureId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cityKey" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "phoneE164" TEXT,
    "phoneDisplay" TEXT,
    "url" TEXT,
    "ratingValue" DOUBLE PRECISION,
    "ratingCount" INTEGER,
    "workHours" JSONB,
    "attributes" JSONB NOT NULL DEFAULT '[]',
    "peopleAlsoSearch" JSONB NOT NULL DEFAULT '[]',
    "placeTopics" JSONB NOT NULL DEFAULT '{}',
    "description" TEXT,
    "descriptionSource" TEXT,
    "siren" TEXT,
    "siret" TEXT,
    "formeJuridiqueCode" TEXT,
    "formeJuridiqueLabel" TEXT,
    "nafCode" TEXT,
    "dateCreation" TEXT,
    "trancheEffectifCode" TEXT,
    "trancheEffectifLabel" TEXT,
    "sireneConfidence" TEXT,
    "services" TEXT[],
    "secteurs" TEXT[],
    "languesEtrangeres" TEXT[],
    "presenceDigitale" BOOLEAN NOT NULL DEFAULT false,
    "imageLogoPath" TEXT,
    "imageMainPath" TEXT,
    "imageLogoQuality" TEXT,
    "imageMainQuality" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "claimStatus" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cabinet_pkey" PRIMARY KEY ("placeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Region_slug_key" ON "Region"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Department_slug_key" ON "Department"("slug");

-- CreateIndex
CREATE INDEX "Department_regionCode_idx" ON "Department"("regionCode");

-- CreateIndex
CREATE INDEX "City_dptCode_idx" ON "City"("dptCode");

-- CreateIndex
CREATE INDEX "City_slug_idx" ON "City"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Cabinet_slug_key" ON "Cabinet"("slug");

-- CreateIndex
CREATE INDEX "Cabinet_cityKey_idx" ON "Cabinet"("cityKey");

-- CreateIndex
CREATE INDEX "Cabinet_featured_idx" ON "Cabinet"("featured");

-- CreateIndex
CREATE INDEX "Cabinet_siren_idx" ON "Cabinet"("siren");

-- CreateIndex
CREATE INDEX "Cabinet_isDeleted_idx" ON "Cabinet"("isDeleted");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_regionCode_fkey" FOREIGN KEY ("regionCode") REFERENCES "Region"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_dptCode_fkey" FOREIGN KEY ("dptCode") REFERENCES "Department"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cabinet" ADD CONSTRAINT "Cabinet_cityKey_fkey" FOREIGN KEY ("cityKey") REFERENCES "City"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
