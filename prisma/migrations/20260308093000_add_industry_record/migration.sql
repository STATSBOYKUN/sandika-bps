-- CreateTable
CREATE TABLE "industry_record" (
    "id" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "namaUsaha" TEXT NOT NULL,
    "kbliKategori" TEXT NOT NULL,
    "provinsiId" TEXT NOT NULL,
    "kabupatenId" TEXT NOT NULL,
    "kecamatanId" TEXT NOT NULL,
    "kecamatanNama" TEXT NOT NULL,
    "desaId" TEXT NOT NULL,
    "desaNama" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "isInsideKaranganyar" BOOLEAN NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industry_record_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "industry_record_sourceKey_key" ON "industry_record"("sourceKey");

-- CreateIndex
CREATE INDEX "industry_record_platform_idx" ON "industry_record"("platform");

-- CreateIndex
CREATE INDEX "industry_record_kecamatanNama_idx" ON "industry_record"("kecamatanNama");
