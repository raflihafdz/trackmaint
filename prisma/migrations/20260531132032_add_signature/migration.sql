-- AlterTable
ALTER TABLE "ChecklistEntry" ADD COLUMN     "signedAt" TIMESTAMP(3),
ADD COLUMN     "signedBy" TEXT;
