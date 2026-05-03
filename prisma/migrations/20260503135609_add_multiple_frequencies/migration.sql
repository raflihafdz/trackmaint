/*
  Warnings:

  - A unique constraint covering the columns `[entryId,itemNo,frequency,tanggal]` on the table `DailyCheck` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ChecklistFrequency" AS ENUM ('HARIAN', 'MINGGUAN', 'BULANAN');

-- DropIndex
DROP INDEX "DailyCheck_entryId_itemNo_tanggal_key";

-- AlterTable
ALTER TABLE "ChecklistEntry" ADD COLUMN     "frequencyTypes" JSONB NOT NULL DEFAULT '["HARIAN"]';

-- AlterTable
ALTER TABLE "DailyCheck" ADD COLUMN     "dayOfWeek" TEXT,
ADD COLUMN     "frequency" "ChecklistFrequency" NOT NULL DEFAULT 'HARIAN';

-- CreateIndex
CREATE UNIQUE INDEX "DailyCheck_entryId_itemNo_frequency_tanggal_key" ON "DailyCheck"("entryId", "itemNo", "frequency", "tanggal");
