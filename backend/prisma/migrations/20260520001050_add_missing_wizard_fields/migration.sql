-- AlterTable
ALTER TABLE "Household" ADD COLUMN     "addressDetails" TEXT,
ADD COLUMN     "addressRegion" TEXT,
ADD COLUMN     "addressStreet" TEXT,
ADD COLUMN     "deathCertNumber" TEXT,
ADD COLUMN     "deathDate" TIMESTAMP(3),
ADD COLUMN     "divorceDocNumber" TEXT,
ADD COLUMN     "divorceYear" INTEGER,
ADD COLUMN     "fieldNotes" TEXT,
ADD COLUMN     "isModest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "marriageCount" INTEGER,
ADD COLUMN     "officeDealings" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "primaryPhone" TEXT,
ADD COLUMN     "registrationDate" TIMESTAMP(3),
ADD COLUMN     "searchType" TEXT DEFAULT 'office',
ADD COLUMN     "secondaryPhone" TEXT,
ADD COLUMN     "socialStatus" TEXT,
ADD COLUMN     "whatsappPhone" TEXT;

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "nationalId" TEXT;
