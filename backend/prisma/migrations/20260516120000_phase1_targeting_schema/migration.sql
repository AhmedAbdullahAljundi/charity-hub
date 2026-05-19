-- Phase 1: Social Assistance Targeting Platform schema (replaces legacy CharityHub tables)

-- Legacy tables (snake_case mapped names)
DROP TABLE IF EXISTS "audit_logs" CASCADE;
DROP TABLE IF EXISTS "scorings" CASCADE;
DROP TABLE IF EXISTS "scoring_rules" CASCADE;
DROP TABLE IF EXISTS "assistances" CASCADE;
DROP TABLE IF EXISTS "education_records" CASCADE;
DROP TABLE IF EXISTS "medical_cases" CASCADE;
DROP TABLE IF EXISTS "incomes" CASCADE;
DROP TABLE IF EXISTS "expenses" CASCADE;
DROP TABLE IF EXISTS "persons" CASCADE;
DROP TABLE IF EXISTS "families" CASCADE;
DROP TABLE IF EXISTS "role_permissions" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "permissions" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;

-- Legacy enums (CASCADE clears dependents; new types created below)
DROP TYPE IF EXISTS "AuditAction" CASCADE;
DROP TYPE IF EXISTS "AssistanceType" CASCADE;
DROP TYPE IF EXISTS "DiseaseSeverity" CASCADE;
DROP TYPE IF EXISTS "MedicalCategory" CASCADE;
DROP TYPE IF EXISTS "IncomeSourceType" CASCADE;
DROP TYPE IF EXISTS "AcademicStatus" CASCADE;
DROP TYPE IF EXISTS "EducationStage" CASCADE;
DROP TYPE IF EXISTS "VulnerabilityClassification" CASCADE;
DROP TYPE IF EXISTS "SocialStatus" CASCADE;
DROP TYPE IF EXISTS "RoleInFamily" CASCADE;
DROP TYPE IF EXISTS "HumanDecisionEnum" CASCADE;
DROP TYPE IF EXISTS "ReviewStatusEnum" CASCADE;
DROP TYPE IF EXISTS "EligibilityLevel" CASCADE;
DROP TYPE IF EXISTS "EducationLevel" CASCADE;
DROP TYPE IF EXISTS "HousingType" CASCADE;
DROP TYPE IF EXISTS "MaritalStatus" CASCADE;
DROP TYPE IF EXISTS "Gender" CASCADE;

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('MARRIED', 'DIVORCED', 'WIDOWED', 'SINGLE');

-- CreateEnum
CREATE TYPE "ResidencyStatus" AS ENUM ('RESIDENT', 'ABSENT_DEATH', 'ABSENT_PRISON', 'ABSENT_DIVORCE', 'ABSENT_OTHER');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('NONE', 'WEAK', 'SEASONAL', 'REGULAR', 'ABROAD_WEAK', 'ABROAD_MEDIUM', 'ABROAD_REGULAR');

-- CreateEnum
CREATE TYPE "EmploymentQuality" AS ENUM ('SUFFICIENT', 'UNSTABLE', 'WEAK');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('ILLITERATE', 'MEDIUM', 'HIGHER_LIMITED', 'HIGHER_STABLE');

-- CreateEnum
CREATE TYPE "StudentLevel" AS ENUM ('CHILD', 'KINDERGARTEN', 'PRIMARY', 'PREPARATORY', 'SECONDARY_GENERAL', 'SECONDARY_VOCATIONAL_FEMALE', 'SECONDARY_VOCATIONAL_MALE', 'UNIVERSITY_SCIENTIFIC', 'UNIVERSITY_HUMANITIES');

-- CreateEnum
CREATE TYPE "PersonRole" AS ENUM ('HEAD', 'SPOUSE', 'CHILD', 'DEPENDENT_ADULT', 'OTHER');

-- CreateEnum
CREATE TYPE "AlimonyStatus" AS ENUM ('FORMAL', 'INFORMAL_SUFFICIENT', 'INFORMAL_INSUFFICIENT', 'NONE');

-- CreateEnum
CREATE TYPE "PrisonTerm" AS ENUM ('SHORT', 'MEDIUM', 'LONG');

-- CreateEnum
CREATE TYPE "HousingType" AS ENUM ('OWNED', 'SHARED', 'DONATED_RENT', 'RENTED');

-- CreateEnum
CREATE TYPE "SeverityGrade" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F');

-- CreateEnum
CREATE TYPE "DiseaseTreatmentCost" AS ENUM ('NONE', 'PERIODIC_CHEAP', 'PERIODIC_EXPENSIVE', 'VERY_EXPENSIVE');

-- CreateEnum
CREATE TYPE "DiseaseFollowup" AS ENUM ('NONE_OR_RARE', 'REGULAR', 'EXPENSIVE');

-- CreateEnum
CREATE TYPE "DiseaseWorkImpact" AS ENUM ('NONE', 'MINOR', 'MAJOR_WORKS', 'CANNOT_WORK');

-- CreateEnum
CREATE TYPE "DisabilityWorkImpact" AS ENUM ('NONE', 'LIMITED', 'SPECIAL_WORK', 'CANNOT_WORK');

-- CreateEnum
CREATE TYPE "DisabilityCompanion" AS ENUM ('NONE', 'OUTSIDE_ONLY', 'FULLY_DEPENDENT');

-- CreateEnum
CREATE TYPE "BurdenType" AS ENUM ('DEBT', 'INJURY', 'SURGERY', 'BRIDE', 'SON_IN_PRISON');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED');

-- CreateEnum
CREATE TYPE "IncomeChannel" AS ENUM ('PENSION', 'TAKAFUL_KARAMA', 'CHARITY_1', 'CHARITY_2', 'CHARITY_3', 'DONOR_1', 'DONOR_2', 'ALIMONY');

-- CreateEnum
CREATE TYPE "EligibilityLevel" AS ENUM ('CRITICAL', 'HIGH_NEED', 'MODERATE_NEED', 'LOW_NEED', 'NOT_ELIGIBLE');

-- CreateEnum
CREATE TYPE "HumanDecision" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVIEW', 'ESCALATED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('AWAITING_SCORE', 'SCORE_READY', 'UNDER_REVIEW', 'FIELD_VISIT_REQUIRED', 'DECIDED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SUPERVISOR', 'WORKER', 'VIEWER');

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('AR', 'EN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'WORKER',
    "preferredLocale" "Locale" NOT NULL DEFAULT 'AR',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Household" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "governorate" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "address" TEXT,
    "housingType" "HousingType" NOT NULL DEFAULT 'OWNED',
    "hasRationCard" BOOLEAN NOT NULL DEFAULT true,
    "hasFamilySupport" BOOLEAN NOT NULL DEFAULT false,
    "hasFoodAid" BOOLEAN NOT NULL DEFAULT false,
    "bankAssetGrade" "SeverityGrade",
    "notes" TEXT,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "lastDraftSavedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "role" "PersonRole" NOT NULL,
    "maritalStatus" "MaritalStatus" NOT NULL DEFAULT 'SINGLE',
    "residencyStatus" "ResidencyStatus" NOT NULL DEFAULT 'RESIDENT',
    "isHead" BOOLEAN NOT NULL DEFAULT false,
    "isStudent" BOOLEAN NOT NULL DEFAULT false,
    "studentLevel" "StudentLevel",
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'NONE',
    "employmentQuality" "EmploymentQuality",
    "educationLevel" "EducationLevel" NOT NULL DEFAULT 'ILLITERATE',
    "alimonyStatus" "AlimonyStatus",
    "isSonContributor" BOOLEAN NOT NULL DEFAULT false,
    "sonMarried" BOOLEAN NOT NULL DEFAULT false,
    "sonSameHouse" BOOLEAN NOT NULL DEFAULT true,
    "isBride" BOOLEAN NOT NULL DEFAULT false,
    "brideHasSponsor" BOOLEAN NOT NULL DEFAULT false,
    "isPrisoner" BOOLEAN NOT NULL DEFAULT false,
    "prisonTerm" "PrisonTerm",
    "prisonSuspicion" DECIMAL(4,2),
    "isOrphan" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Disease" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "treatmentCost" "DiseaseTreatmentCost" NOT NULL DEFAULT 'NONE',
    "followup" "DiseaseFollowup" NOT NULL DEFAULT 'NONE_OR_RARE',
    "workImpact" "DiseaseWorkImpact" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Disease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Disability" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "workImpact" "DisabilityWorkImpact" NOT NULL DEFAULT 'NONE',
    "companion" "DisabilityCompanion" NOT NULL DEFAULT 'NONE',
    "treatmentCost" "DiseaseTreatmentCost" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Disability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemporaryBurden" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "type" "BurdenType" NOT NULL,
    "grade" "SeverityGrade",
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemporaryBurden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomeSource" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "channel" "IncomeChannel" NOT NULL,
    "monthlyAmount" DECIMAL(10,2) NOT NULL,
    "verified" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "verificationNote" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncomeSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreResult" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "engineVersion" TEXT NOT NULL,
    "ruleVersion" TEXT NOT NULL,
    "weightsSnapshot" JSONB NOT NULL,
    "vulnerabilityScore" DECIMAL(8,4) NOT NULL,
    "reductionScore" DECIMAL(8,4) NOT NULL,
    "confidenceScore" DECIMAL(4,3) NOT NULL,
    "fraudRiskScore" DECIMAL(4,3) NOT NULL,
    "finalScore" DECIMAL(8,4) NOT NULL,
    "normalizedPercent" DECIMAL(6,3) NOT NULL,
    "systemRecommendation" "EligibilityLevel" NOT NULL,
    "humanDecision" "HumanDecision" NOT NULL DEFAULT 'PENDING',
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'SCORE_READY',
    "decisionNote" TEXT,
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "previousScore" DECIMAL(8,4),
    "scoreDelta" DECIMAL(8,4),
    "calculationSnapshot" JSONB NOT NULL,
    "layerBreakdown" JSONB NOT NULL,
    "topPositiveFactors" JSONB NOT NULL,
    "topNegativeFactors" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "warnings" JSONB NOT NULL,
    "rawInputSnapshot" JSONB NOT NULL,

    CONSTRAINT "ScoreResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleOverride" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "overrideValue" DECIMAL(6,3) NOT NULL,
    "reason" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "setById" TEXT NOT NULL,
    "setAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "RuleOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "householdId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "fieldName" TEXT,
    "before" JSONB,
    "after" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Household_code_key" ON "Household"("code");

-- CreateIndex
CREATE INDEX "Household_governorate_district_idx" ON "Household"("governorate", "district");

-- CreateIndex
CREATE INDEX "Household_isDraft_idx" ON "Household"("isDraft");

-- CreateIndex
CREATE INDEX "Household_createdById_idx" ON "Household"("createdById");

-- CreateIndex
CREATE INDEX "Household_code_idx" ON "Household"("code");

-- CreateIndex
CREATE INDEX "Person_householdId_idx" ON "Person"("householdId");

-- CreateIndex
CREATE INDEX "Person_isHead_idx" ON "Person"("isHead");

-- CreateIndex
CREATE INDEX "Person_role_idx" ON "Person"("role");

-- CreateIndex
CREATE INDEX "Person_isStudent_idx" ON "Person"("isStudent");

-- CreateIndex
CREATE INDEX "Disease_personId_idx" ON "Disease"("personId");

-- CreateIndex
CREATE INDEX "Disability_personId_idx" ON "Disability"("personId");

-- CreateIndex
CREATE INDEX "TemporaryBurden_householdId_idx" ON "TemporaryBurden"("householdId");

-- CreateIndex
CREATE INDEX "IncomeSource_householdId_idx" ON "IncomeSource"("householdId");

-- CreateIndex
CREATE INDEX "IncomeSource_verified_idx" ON "IncomeSource"("verified");

-- CreateIndex
CREATE INDEX "IncomeSource_channel_verified_idx" ON "IncomeSource"("channel", "verified");

-- CreateIndex
CREATE UNIQUE INDEX "IncomeSource_householdId_channel_key" ON "IncomeSource"("householdId", "channel");

-- CreateIndex
CREATE INDEX "ScoreResult_householdId_idx" ON "ScoreResult"("householdId");

-- CreateIndex
CREATE INDEX "ScoreResult_calculatedAt_idx" ON "ScoreResult"("calculatedAt");

-- CreateIndex
CREATE INDEX "ScoreResult_systemRecommendation_idx" ON "ScoreResult"("systemRecommendation");

-- CreateIndex
CREATE INDEX "ScoreResult_humanDecision_idx" ON "ScoreResult"("humanDecision");

-- CreateIndex
CREATE INDEX "ScoreResult_householdId_calculatedAt_idx" ON "ScoreResult"("householdId", "calculatedAt");

-- CreateIndex
CREATE INDEX "ScoreResult_calculatedAt_systemRecommendation_idx" ON "ScoreResult"("calculatedAt", "systemRecommendation");

-- CreateIndex
CREATE UNIQUE INDEX "RuleOverride_ruleId_key" ON "RuleOverride"("ruleId");

-- CreateIndex
CREATE INDEX "RuleOverride_active_idx" ON "RuleOverride"("active");

-- CreateIndex
CREATE INDEX "RuleOverride_ruleId_idx" ON "RuleOverride"("ruleId");

-- CreateIndex
CREATE INDEX "AuditLog_householdId_idx" ON "AuditLog"("householdId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- AddForeignKey
ALTER TABLE "Household" ADD CONSTRAINT "Household_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disease" ADD CONSTRAINT "Disease_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disability" ADD CONSTRAINT "Disability_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemporaryBurden" ADD CONSTRAINT "TemporaryBurden_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomeSource" ADD CONSTRAINT "IncomeSource_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreResult" ADD CONSTRAINT "ScoreResult_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreResult" ADD CONSTRAINT "ScoreResult_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE SET NULL ON UPDATE CASCADE;
