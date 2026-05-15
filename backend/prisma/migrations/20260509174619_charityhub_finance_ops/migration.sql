-- CreateEnum
CREATE TYPE "AssistanceWorkflowStatus" AS ENUM ('REQUESTED', 'APPROVED', 'COMMITTED', 'DISBURSED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DonationCategory" AS ENUM ('CASH', 'MEDICAL', 'FOOD', 'EDUCATION', 'GENERAL');

-- CreateEnum
CREATE TYPE "DonationAllocationStatus" AS ENUM ('UNALLOCATED', 'PARTIAL', 'FULLY_ALLOCATED');

-- CreateEnum
CREATE TYPE "DonationRecurrence" AS ENUM ('ONE_TIME', 'RECURRING');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "AlertCategory" AS ENUM ('FINANCE', 'MEDICAL', 'FIELD_RESEARCH', 'SCORING', 'OPERATIONAL');

-- AlterTable
ALTER TABLE "assistances" ADD COLUMN     "approval_chain" JSONB,
ADD COLUMN     "confirmed_at" TIMESTAMP(3),
ADD COLUMN     "impact_note" TEXT,
ADD COLUMN     "workflow_status" "AssistanceWorkflowStatus" NOT NULL DEFAULT 'DISBURSED';

-- AlterTable
ALTER TABLE "families" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "donations" (
    "id" UUID NOT NULL,
    "source_display" TEXT,
    "donor_ref_code" TEXT,
    "category" "DonationCategory" NOT NULL DEFAULT 'GENERAL',
    "recurrence" "DonationRecurrence" NOT NULL DEFAULT 'ONE_TIME',
    "amount" DECIMAL(14,2) NOT NULL,
    "allocation_status" "DonationAllocationStatus" NOT NULL DEFAULT 'UNALLOCATED',
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "earmark_family_id" UUID,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational_alerts" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "severity" "AlertSeverity" NOT NULL,
    "category" "AlertCategory" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'OPEN',
    "family_id" UUID,
    "source_ref" TEXT,
    "acknowledged_by" UUID,
    "acknowledged_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "escalation_level" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operational_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "donations_donor_ref_code_key" ON "donations"("donor_ref_code");

-- CreateIndex
CREATE INDEX "donations_received_at_idx" ON "donations"("received_at");

-- CreateIndex
CREATE INDEX "donations_category_idx" ON "donations"("category");

-- CreateIndex
CREATE INDEX "donations_allocation_status_idx" ON "donations"("allocation_status");

-- CreateIndex
CREATE INDEX "donations_earmark_family_id_idx" ON "donations"("earmark_family_id");

-- CreateIndex
CREATE INDEX "operational_alerts_status_severity_idx" ON "operational_alerts"("status", "severity");

-- CreateIndex
CREATE INDEX "operational_alerts_category_idx" ON "operational_alerts"("category");

-- CreateIndex
CREATE INDEX "operational_alerts_created_at_idx" ON "operational_alerts"("created_at");

-- CreateIndex
CREATE INDEX "operational_alerts_family_id_idx" ON "operational_alerts"("family_id");

-- CreateIndex
CREATE INDEX "families_deleted_at_idx" ON "families"("deleted_at");

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_earmark_family_id_fkey" FOREIGN KEY ("earmark_family_id") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operational_alerts" ADD CONSTRAINT "operational_alerts_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operational_alerts" ADD CONSTRAINT "operational_alerts_acknowledged_by_fkey" FOREIGN KEY ("acknowledged_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
