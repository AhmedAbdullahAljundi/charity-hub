/*
  Warnings:

  - You are about to drop the column `approval_chain` on the `assistances` table. All the data in the column will be lost.
  - You are about to drop the column `confirmed_at` on the `assistances` table. All the data in the column will be lost.
  - You are about to drop the column `impact_note` on the `assistances` table. All the data in the column will be lost.
  - You are about to drop the column `workflow_status` on the `assistances` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `families` table. All the data in the column will be lost.
  - You are about to drop the `donations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `operational_alerts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "donations" DROP CONSTRAINT "donations_earmark_family_id_fkey";

-- DropForeignKey
ALTER TABLE "operational_alerts" DROP CONSTRAINT "operational_alerts_acknowledged_by_fkey";

-- DropForeignKey
ALTER TABLE "operational_alerts" DROP CONSTRAINT "operational_alerts_family_id_fkey";

-- DropIndex
DROP INDEX "families_deleted_at_idx";

-- DropIndex
DROP INDEX "scorings_calculated_at_idx";

-- DropIndex
DROP INDEX "scorings_family_id_calculated_at_idx";

-- AlterTable
ALTER TABLE "assistances" DROP COLUMN "approval_chain",
DROP COLUMN "confirmed_at",
DROP COLUMN "impact_note",
DROP COLUMN "workflow_status";

-- AlterTable
ALTER TABLE "families" DROP COLUMN "deleted_at";

-- DropTable
DROP TABLE "donations";

-- DropTable
DROP TABLE "operational_alerts";

-- DropEnum
DROP TYPE "AlertCategory";

-- DropEnum
DROP TYPE "AlertSeverity";

-- DropEnum
DROP TYPE "AlertStatus";

-- DropEnum
DROP TYPE "AssistanceWorkflowStatus";

-- DropEnum
DROP TYPE "DonationAllocationStatus";

-- DropEnum
DROP TYPE "DonationCategory";

-- DropEnum
DROP TYPE "DonationRecurrence";

-- CreateIndex
CREATE INDEX "expenses_date_idx" ON "expenses"("date");

-- CreateIndex
CREATE INDEX "families_created_at_idx" ON "families"("created_at" DESC);

-- CreateIndex
CREATE INDEX "incomes_created_at_idx" ON "incomes"("created_at");

-- CreateIndex
CREATE INDEX "persons_family_id_role_in_family_idx" ON "persons"("family_id", "role_in_family");

-- CreateIndex
CREATE INDEX "persons_full_name_idx" ON "persons"("full_name");

-- CreateIndex
CREATE INDEX "scorings_family_id_calculated_at_idx" ON "scorings"("family_id", "calculated_at" DESC);

-- CreateIndex
CREATE INDEX "scorings_calculated_at_idx" ON "scorings"("calculated_at" DESC);
