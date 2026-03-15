-- CreateEnum
CREATE TYPE "HousingType" AS ENUM ('OWNED', 'RENT', 'SHARED');

-- CreateEnum
CREATE TYPE "RoleInFamily" AS ENUM ('HUSBAND', 'WIFE', 'CHILD', 'OTHER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('NONE', 'NURSERY', 'PRIMARY', 'PREPARATORY', 'SECONDARY', 'UNIVERSITY');

-- CreateEnum
CREATE TYPE "EducationStage" AS ENUM ('NURSERY', 'PRIMARY', 'PREPARATORY', 'SECONDARY', 'UNIVERSITY');

-- CreateEnum
CREATE TYPE "AcademicStatus" AS ENUM ('ENROLLED', 'DROPPED', 'GRADUATED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "IncomeSourceType" AS ENUM ('SALARY', 'PENSION', 'AID', 'NAFAKA', 'FAMILY_SUPPORT', 'CHARITY', 'TAKAFUL_KARAMA', 'PROJECT', 'PROPERTY', 'CHILDREN_INCOME', 'RATION_CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "MedicalCategory" AS ENUM ('A', 'B', 'C', 'D');

-- CreateEnum
CREATE TYPE "DiseaseSeverity" AS ENUM ('MILD', 'MODERATE', 'SEVERE', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AssistanceType" AS ENUM ('FINANCIAL', 'FOOD', 'CLOTHING', 'MEDICAL', 'EDUCATION', 'IN_KIND');

-- CreateEnum
CREATE TYPE "VulnerabilityClassification" AS ENUM ('VERY_FRAGILE', 'FRAGILE', 'WEAK', 'MODERATE', 'OUT_OF_PRIORITY');

-- CreateEnum
CREATE TYPE "SocialStatus" AS ENUM ('ORPHANS', 'DIVORCED', 'POOR', 'NEEDY', 'DISABILITY', 'STUDENT', 'PRISONER', 'ELDERLY', 'ABANDONMENT', 'CHRONIC_DISEASE', 'TEMPORARY_INJURY', 'OTHER');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "families" (
    "id" UUID NOT NULL,
    "registration_number" TEXT NOT NULL,
    "social_status" "SocialStatus",
    "address" TEXT NOT NULL,
    "region" TEXT,
    "housing_type" "HousingType" NOT NULL,
    "rent_value" DECIMAL(12,2),
    "phone" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persons" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "national_id" TEXT,
    "role_in_family" "RoleInFamily" NOT NULL,
    "gender" "Gender" NOT NULL,
    "birth_date" TIMESTAMP(3),
    "marital_status" "MaritalStatus",
    "education_level" "EducationLevel",
    "occupation" TEXT,
    "smoker" BOOLEAN NOT NULL DEFAULT false,
    "disability" BOOLEAN NOT NULL DEFAULT false,
    "deceased" BOOLEAN NOT NULL DEFAULT false,
    "death_year" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incomes" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "source_type" "IncomeSourceType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_cases" (
    "id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "disease_name" TEXT NOT NULL,
    "disease_severity" "DiseaseSeverity",
    "chronic" BOOLEAN NOT NULL DEFAULT false,
    "medical_category" "MedicalCategory",
    "doctor_name" TEXT,
    "treatment_cost" DECIMAL(12,2),
    "last_service_date" TIMESTAMP(3),
    "next_allowed_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_records" (
    "id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "school_name" TEXT NOT NULL,
    "stage" "EducationStage",
    "grade" TEXT,
    "academic_status" "AcademicStatus",
    "memorization_level" TEXT,
    "performance_score" DOUBLE PRECISION,
    "dropout_risk" BOOLEAN NOT NULL DEFAULT false,
    "academic_year" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assistances" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "assistance_type" "AssistanceType" NOT NULL,
    "provider_name" TEXT,
    "amount" DECIMAL(12,2),
    "items" JSONB,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assistances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scorings" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "total_need" DECIMAL(14,4) NOT NULL,
    "total_income" DECIMAL(14,4) NOT NULL,
    "vulnerability_index" DECIMAL(10,4) NOT NULL,
    "classification" "VulnerabilityClassification" NOT NULL,
    "breakdown" JSONB,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scorings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scoring_rules" (
    "id" UUID NOT NULL,
    "rule_key" TEXT NOT NULL,
    "coefficient" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "scoring_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role_id" UUID NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "table_name" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "changed_by" UUID,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "old_data" JSONB,
    "new_data" JSONB,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "families_registration_number_key" ON "families"("registration_number");

-- CreateIndex
CREATE INDEX "families_registration_number_idx" ON "families"("registration_number");

-- CreateIndex
CREATE INDEX "families_social_status_idx" ON "families"("social_status");

-- CreateIndex
CREATE INDEX "families_region_idx" ON "families"("region");

-- CreateIndex
CREATE INDEX "families_housing_type_idx" ON "families"("housing_type");

-- CreateIndex
CREATE UNIQUE INDEX "persons_national_id_key" ON "persons"("national_id");

-- CreateIndex
CREATE INDEX "persons_family_id_idx" ON "persons"("family_id");

-- CreateIndex
CREATE INDEX "persons_national_id_idx" ON "persons"("national_id");

-- CreateIndex
CREATE INDEX "persons_role_in_family_idx" ON "persons"("role_in_family");

-- CreateIndex
CREATE INDEX "persons_gender_idx" ON "persons"("gender");

-- CreateIndex
CREATE INDEX "persons_birth_date_idx" ON "persons"("birth_date");

-- CreateIndex
CREATE INDEX "incomes_family_id_idx" ON "incomes"("family_id");

-- CreateIndex
CREATE INDEX "incomes_source_type_idx" ON "incomes"("source_type");

-- CreateIndex
CREATE INDEX "incomes_verified_idx" ON "incomes"("verified");

-- CreateIndex
CREATE INDEX "medical_cases_person_id_idx" ON "medical_cases"("person_id");

-- CreateIndex
CREATE INDEX "medical_cases_medical_category_idx" ON "medical_cases"("medical_category");

-- CreateIndex
CREATE INDEX "medical_cases_chronic_idx" ON "medical_cases"("chronic");

-- CreateIndex
CREATE INDEX "medical_cases_last_service_date_idx" ON "medical_cases"("last_service_date");

-- CreateIndex
CREATE INDEX "education_records_person_id_idx" ON "education_records"("person_id");

-- CreateIndex
CREATE INDEX "education_records_academic_status_idx" ON "education_records"("academic_status");

-- CreateIndex
CREATE INDEX "education_records_stage_idx" ON "education_records"("stage");

-- CreateIndex
CREATE INDEX "assistances_family_id_idx" ON "assistances"("family_id");

-- CreateIndex
CREATE INDEX "assistances_assistance_type_idx" ON "assistances"("assistance_type");

-- CreateIndex
CREATE INDEX "assistances_date_idx" ON "assistances"("date");

-- CreateIndex
CREATE INDEX "scorings_family_id_idx" ON "scorings"("family_id");

-- CreateIndex
CREATE INDEX "scorings_family_id_calculated_at_idx" ON "scorings"("family_id", "calculated_at");

-- CreateIndex
CREATE INDEX "scorings_classification_idx" ON "scorings"("classification");

-- CreateIndex
CREATE INDEX "scorings_vulnerability_index_idx" ON "scorings"("vulnerability_index");

-- CreateIndex
CREATE INDEX "scorings_calculated_at_idx" ON "scorings"("calculated_at");

-- CreateIndex
CREATE UNIQUE INDEX "scoring_rules_rule_key_key" ON "scoring_rules"("rule_key");

-- CreateIndex
CREATE INDEX "scoring_rules_active_idx" ON "scoring_rules"("active");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_id_idx" ON "users"("role_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "audit_logs_table_name_idx" ON "audit_logs"("table_name");

-- CreateIndex
CREATE INDEX "audit_logs_record_id_idx" ON "audit_logs"("record_id");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_changed_by_idx" ON "audit_logs"("changed_by");

-- CreateIndex
CREATE INDEX "audit_logs_table_name_record_id_idx" ON "audit_logs"("table_name", "record_id");

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_cases" ADD CONSTRAINT "medical_cases_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_records" ADD CONSTRAINT "education_records_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assistances" ADD CONSTRAINT "assistances_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scorings" ADD CONSTRAINT "scorings_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
