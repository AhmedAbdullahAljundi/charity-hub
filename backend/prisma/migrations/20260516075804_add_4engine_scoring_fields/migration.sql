-- CreateEnum
CREATE TYPE "EligibilityLevel" AS ENUM ('CRITICAL_PRIORITY', 'HIGH_PRIORITY', 'MEDIUM_PRIORITY', 'LOW_PRIORITY', 'NOT_ELIGIBLE');

-- CreateEnum
CREATE TYPE "HumanDecisionEnum" AS ENUM ('PENDING', 'APPROVED', 'APPROVED_PARTIAL', 'REJECTED', 'DEFERRED');

-- CreateEnum
CREATE TYPE "ReviewStatusEnum" AS ENUM ('PENDING_REVIEW', 'UNDER_REVIEW', 'FIELD_VISIT_REQUIRED', 'COMPLETED');

-- AlterTable
ALTER TABLE "scorings" ADD COLUMN     "confidence_score" DECIMAL(6,4),
ADD COLUMN     "decided_by" UUID,
ADD COLUMN     "decision_notes" TEXT,
ADD COLUMN     "final_score" DECIMAL(14,4),
ADD COLUMN     "fraud_risk_score" DECIMAL(6,4),
ADD COLUMN     "human_decision" "HumanDecisionEnum",
ADD COLUMN     "layer_breakdown" JSONB,
ADD COLUMN     "normalized_percent" DECIMAL(6,2),
ADD COLUMN     "recommendations" JSONB,
ADD COLUMN     "reduction_score" DECIMAL(14,4),
ADD COLUMN     "review_status" "ReviewStatusEnum",
ADD COLUMN     "score_delta" DECIMAL(14,4),
ADD COLUMN     "snapshot" JSONB,
ADD COLUMN     "system_recommendation" "EligibilityLevel",
ADD COLUMN     "top_negative_factors" JSONB,
ADD COLUMN     "top_positive_factors" JSONB,
ADD COLUMN     "vulnerability_score" DECIMAL(14,4),
ADD COLUMN     "warnings" JSONB;

-- CreateIndex
CREATE INDEX "scorings_system_recommendation_idx" ON "scorings"("system_recommendation");

-- CreateIndex
CREATE INDEX "scorings_human_decision_idx" ON "scorings"("human_decision");

-- CreateIndex
CREATE INDEX "scorings_review_status_idx" ON "scorings"("review_status");
