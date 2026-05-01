-- CreateEnum
CREATE TYPE "ChecklistType" AS ENUM ('MOBIL_FOAM_TENDER', 'CONVEYOR_KEDATANGAN', 'CONVEYOR_KEBERANGKATAN', 'TRAKTOR', 'MOBIL_OPERASIONAL');

-- CreateEnum
CREATE TYPE "DailyCheckStatus" AS ENUM ('NORMAL', 'GANGGUAN', 'KOSONG');

-- CreateTable
CREATE TABLE "ChecklistEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fasilitas" TEXT NOT NULL,
    "peralatan" TEXT NOT NULL,
    "merkType" TEXT NOT NULL,
    "bulan" TEXT NOT NULL,
    "tahun" TEXT NOT NULL,
    "checklistType" "ChecklistType" NOT NULL,
    "keterangan" TEXT,
    "petugas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "koordinatorNama" TEXT NOT NULL,
    "koordinatorNIP" TEXT NOT NULL,
    "koordinatorUnit" TEXT NOT NULL,

    CONSTRAINT "ChecklistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyCheck" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "itemNo" INTEGER NOT NULL,
    "itemLabel" TEXT NOT NULL,
    "tanggal" INTEGER NOT NULL,
    "status" "DailyCheckStatus" NOT NULL DEFAULT 'KOSONG',

    CONSTRAINT "DailyCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChecklistEntry_createdAt_idx" ON "ChecklistEntry"("createdAt");

-- CreateIndex
CREATE INDEX "ChecklistEntry_checklistType_idx" ON "ChecklistEntry"("checklistType");

-- CreateIndex
CREATE INDEX "DailyCheck_entryId_idx" ON "DailyCheck"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyCheck_entryId_itemNo_tanggal_key" ON "DailyCheck"("entryId", "itemNo", "tanggal");

-- AddForeignKey
ALTER TABLE "DailyCheck" ADD CONSTRAINT "DailyCheck_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "ChecklistEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
