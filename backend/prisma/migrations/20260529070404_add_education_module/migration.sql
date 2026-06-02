-- CreateEnum
CREATE TYPE "GradeInputType" AS ENUM ('LETTER', 'NUMERIC');

-- CreateEnum
CREATE TYPE "LetterGrade" AS ENUM ('FAIL', 'PASS', 'GOOD', 'VERY_GOOD', 'EXCELLENT');

-- CreateEnum
CREATE TYPE "QuranInstitute" AS ENUM ('IBN_MASOOD', 'UQBA_BIN_AAMER', 'DESOUKI_MOSQUE', 'SHARIA_SOCIETY', 'IQRAA', 'OTHER');

-- CreateTable
CREATE TABLE "StudentAcademicRecord" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "studentLevel" "StudentLevel" NOT NULL,
    "isRepeating" BOOLEAN NOT NULL DEFAULT false,
    "gradeInputType" "GradeInputType" NOT NULL DEFAULT 'LETTER',
    "subjects" JSONB NOT NULL DEFAULT '[]',
    "averageScore" DECIMAL(5,2),
    "overallGrade" "LetterGrade",
    "quranJuzCount" DECIMAL(4,1),
    "quranProgress" DECIMAL(5,2),
    "quranLastSurah" TEXT,
    "quranCustomText" TEXT,
    "quranTeacher" TEXT,
    "quranInstitute" "QuranInstitute",
    "quranCustomInstitute" TEXT,
    "quranGrade" DECIMAL(5,2),
    "quranAbsenceDays" INTEGER DEFAULT 0,
    "quranOverallScore" DECIMAL(5,2),
    "totalScore" DECIMAL(5,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "StudentAcademicRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentAcademicRecord_householdId_idx" ON "StudentAcademicRecord"("householdId");

-- CreateIndex
CREATE INDEX "StudentAcademicRecord_personId_idx" ON "StudentAcademicRecord"("personId");

-- CreateIndex
CREATE INDEX "StudentAcademicRecord_academicYear_idx" ON "StudentAcademicRecord"("academicYear");

-- CreateIndex
CREATE INDEX "StudentAcademicRecord_studentLevel_idx" ON "StudentAcademicRecord"("studentLevel");

-- CreateIndex
CREATE INDEX "StudentAcademicRecord_totalScore_idx" ON "StudentAcademicRecord"("totalScore");

-- CreateIndex
CREATE INDEX "StudentAcademicRecord_quranProgress_idx" ON "StudentAcademicRecord"("quranProgress");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAcademicRecord_personId_academicYear_key" ON "StudentAcademicRecord"("personId", "academicYear");

-- AddForeignKey
ALTER TABLE "StudentAcademicRecord" ADD CONSTRAINT "StudentAcademicRecord_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAcademicRecord" ADD CONSTRAINT "StudentAcademicRecord_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
