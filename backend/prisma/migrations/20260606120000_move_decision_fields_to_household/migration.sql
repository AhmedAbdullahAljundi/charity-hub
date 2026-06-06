-- Add decision workflow state to Household.
ALTER TABLE "Household" ADD COLUMN "humanDecision" "HumanDecision" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Household" ADD COLUMN "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'SCORE_READY';
ALTER TABLE "Household" ADD COLUMN "decisionNote" TEXT;
ALTER TABLE "Household" ADD COLUMN "decidedById" TEXT;
ALTER TABLE "Household" ADD COLUMN "decidedAt" TIMESTAMP(3);

-- Link household decisions to the deciding user without changing ScoreResult relations.
ALTER TABLE "Household" ADD CONSTRAINT "Household_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
