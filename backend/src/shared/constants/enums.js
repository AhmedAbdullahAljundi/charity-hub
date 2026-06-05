/**
 * Application enums — mirror Prisma schema (Phase 1).
 * Use these in business logic; DB values must stay in sync with schema.prisma.
 */

const Gender = Object.freeze({
  MALE: 'MALE',
  FEMALE: 'FEMALE',
});

const MaritalStatus = Object.freeze({
  MARRIED: 'MARRIED',
  DIVORCED: 'DIVORCED',
  WIDOWED: 'WIDOWED',
  SINGLE: 'SINGLE',
});

const ResidencyStatus = Object.freeze({
  RESIDENT: 'RESIDENT',
  ABSENT_DEATH: 'ABSENT_DEATH',
  ABSENT_PRISON: 'ABSENT_PRISON',
  ABSENT_DIVORCE: 'ABSENT_DIVORCE',
  ABSENT_OTHER: 'ABSENT_OTHER',
});

const EmploymentType = Object.freeze({
  NONE: 'NONE',
  WEAK: 'WEAK',
  SEASONAL: 'SEASONAL',
  REGULAR: 'REGULAR',
  ABROAD_WEAK: 'ABROAD_WEAK',
  ABROAD_MEDIUM: 'ABROAD_MEDIUM',
  ABROAD_REGULAR: 'ABROAD_REGULAR',
});

const EmploymentQuality = Object.freeze({
  SUFFICIENT: 'SUFFICIENT',
  UNSTABLE: 'UNSTABLE',
  WEAK: 'WEAK',
});

const EducationLevel = Object.freeze({
  ILLITERATE: 'ILLITERATE',
  MEDIUM: 'MEDIUM',
  HIGHER_LIMITED: 'HIGHER_LIMITED',
  HIGHER_STABLE: 'HIGHER_STABLE',
});

const StudentLevel = Object.freeze({
  CHILD: 'CHILD',
  KINDERGARTEN: 'KINDERGARTEN',
  PRIMARY: 'PRIMARY',
  PREPARATORY: 'PREPARATORY',
  SECONDARY_GENERAL: 'SECONDARY_GENERAL',
  SECONDARY_VOCATIONAL_FEMALE: 'SECONDARY_VOCATIONAL_FEMALE',
  SECONDARY_VOCATIONAL_MALE: 'SECONDARY_VOCATIONAL_MALE',
  UNIVERSITY_SCIENTIFIC: 'UNIVERSITY_SCIENTIFIC',
  UNIVERSITY_HUMANITIES: 'UNIVERSITY_HUMANITIES',
});

const PersonRole = Object.freeze({
  HEAD: 'HEAD',
  SPOUSE: 'SPOUSE',
  CHILD: 'CHILD',
  DEPENDENT_ADULT: 'DEPENDENT_ADULT',
  INDEPENDENT: 'INDEPENDENT',
  OTHER: 'OTHER',
});

const AlimonyStatus = Object.freeze({
  FORMAL: 'FORMAL',
  INFORMAL_SUFFICIENT: 'INFORMAL_SUFFICIENT',
  INFORMAL_INSUFFICIENT: 'INFORMAL_INSUFFICIENT',
  NONE: 'NONE',
});

const PrisonTerm = Object.freeze({
  SHORT: 'SHORT',
  MEDIUM: 'MEDIUM',
  LONG: 'LONG',
});

const HousingType = Object.freeze({
  OWNED: 'OWNED',
  SHARED: 'SHARED',
  DONATED_RENT: 'DONATED_RENT',
  RENTED: 'RENTED',
});

const SeverityGrade = Object.freeze({
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
  E: 'E',
  F: 'F',
});

const DiseaseTreatmentCost = Object.freeze({
  NONE: 'NONE',
  PERIODIC_CHEAP: 'PERIODIC_CHEAP',
  PERIODIC_EXPENSIVE: 'PERIODIC_EXPENSIVE',
  VERY_EXPENSIVE: 'VERY_EXPENSIVE',
});

const DiseaseFollowup = Object.freeze({
  NONE_OR_RARE: 'NONE_OR_RARE',
  REGULAR: 'REGULAR',
  EXPENSIVE: 'EXPENSIVE',
});

const DiseaseWorkImpact = Object.freeze({
  NONE: 'NONE',
  MINOR: 'MINOR',
  MAJOR_WORKS: 'MAJOR_WORKS',
  CANNOT_WORK: 'CANNOT_WORK',
});

const DisabilityWorkImpact = Object.freeze({
  NONE: 'NONE',
  LIMITED: 'LIMITED',
  SPECIAL_WORK: 'SPECIAL_WORK',
  CANNOT_WORK: 'CANNOT_WORK',
});

const DisabilityCompanion = Object.freeze({
  NONE: 'NONE',
  OUTSIDE_ONLY: 'OUTSIDE_ONLY',
  FULLY_DEPENDENT: 'FULLY_DEPENDENT',
});

const BurdenType = Object.freeze({
  DEBT: 'DEBT',
  INJURY: 'INJURY',
  SURGERY: 'SURGERY',
  BRIDE: 'BRIDE',
  SON_IN_PRISON: 'SON_IN_PRISON',
});

const VerificationStatus = Object.freeze({
  UNVERIFIED: 'UNVERIFIED',
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
});

const IncomeChannel = Object.freeze({
  PENSION: 'PENSION',
  TAKAFUL_KARAMA: 'TAKAFUL_KARAMA',
  CHARITY_1: 'CHARITY_1',
  CHARITY_2: 'CHARITY_2',
  CHARITY_3: 'CHARITY_3',
  DONOR_1: 'DONOR_1',
  DONOR_2: 'DONOR_2',
  ALIMONY: 'ALIMONY',
});

/** All 8 income channels (verification math) */
const INCOME_CHANNELS = Object.freeze(Object.values(IncomeChannel));

const EligibilityLevel = Object.freeze({
  CRITICAL: 'CRITICAL',
  HIGH_NEED: 'HIGH_NEED',
  MODERATE_NEED: 'MODERATE_NEED',
  LOW_NEED: 'LOW_NEED',
  NOT_ELIGIBLE: 'NOT_ELIGIBLE',
});

const HumanDecision = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
  ESCALATED: 'ESCALATED',
});

const ReviewStatus = Object.freeze({
  AWAITING_SCORE: 'AWAITING_SCORE',
  SCORE_READY: 'SCORE_READY',
  UNDER_REVIEW: 'UNDER_REVIEW',
  FIELD_VISIT_REQUIRED: 'FIELD_VISIT_REQUIRED',
  DECIDED: 'DECIDED',
});

const UserRole = Object.freeze({
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  WORKER: 'WORKER',
  VIEWER: 'VIEWER',
});

const Locale = Object.freeze({
  AR: 'AR',
  EN: 'EN',
});

module.exports = {
  Gender,
  MaritalStatus,
  ResidencyStatus,
  EmploymentType,
  EmploymentQuality,
  EducationLevel,
  StudentLevel,
  PersonRole,
  AlimonyStatus,
  PrisonTerm,
  HousingType,
  SeverityGrade,
  DiseaseTreatmentCost,
  DiseaseFollowup,
  DiseaseWorkImpact,
  DisabilityWorkImpact,
  DisabilityCompanion,
  BurdenType,
  VerificationStatus,
  IncomeChannel,
  INCOME_CHANNELS,
  EligibilityLevel,
  HumanDecision,
  ReviewStatus,
  UserRole,
  Locale,
};
