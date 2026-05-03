/*
  Warnings:

  - You are about to drop the column `highlightEndDay` on the `ChecklistEntry` table. All the data in the column will be lost.
  - You are about to drop the column `highlightStartDay` on the `ChecklistEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChecklistEntry" DROP COLUMN "highlightEndDay",
DROP COLUMN "highlightStartDay",
ADD COLUMN     "highlightRanges" JSONB NOT NULL DEFAULT '[{"start": 18, "end": 24}]';
