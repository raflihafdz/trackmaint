-- AlterTable
ALTER TABLE "ChecklistEntry" ADD COLUMN     "highlightEndDay" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "highlightStartDay" INTEGER NOT NULL DEFAULT 18;
