/*
  Warnings:

  - You are about to drop the column `frequencyTypes` on the `ChecklistEntry` table. All the data in the column will be lost.
  - You are about to drop the column `dayOfWeek` on the `DailyCheck` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `DailyCheck` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[entryId,itemNo,tanggal]` on the table `DailyCheck` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "DailyCheck_entryId_itemNo_frequency_tanggal_key";

-- AlterTable
ALTER TABLE "ChecklistEntry" DROP COLUMN "frequencyTypes";

-- AlterTable
ALTER TABLE "DailyCheck" DROP COLUMN "dayOfWeek",
DROP COLUMN "frequency";

-- DropEnum
DROP TYPE "ChecklistFrequency";

-- CreateIndex
CREATE UNIQUE INDEX "DailyCheck_entryId_itemNo_tanggal_key" ON "DailyCheck"("entryId", "itemNo", "tanggal");
