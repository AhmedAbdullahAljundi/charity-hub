/** Phase 3 API shapes — presentation only, no scoring logic. */

export type EligibilityLevel =
  | "CRITICAL"
  | "HIGH_NEED"
  | "MODERATE_NEED"
  | "LOW_NEED"
  | "NOT_ELIGIBLE";

export type UserRole = "ADMIN" | "SUPERVISOR" | "WORKER" | "VIEWER";

export interface ApiUser {
  id: string;
  name: string;
  nameAr?: string;
  email: string;
  role: UserRole;
  preferredLocale?: string;
  assignedGovernorate?: string | null;
  assignedDistrict?: string | null;
  permissions?: string[];
  customPermissions?: string[];
  mustChangePassword?: boolean;
  passwordResetRequest?: boolean;
  lastLoginAt?: string | null;
  active?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: ApiUser;
}

export interface PersonDto {
  id: string;
  name: string;
  nationalId?: string;
  gender: string;
  birthDate: string;
  role: string;
  maritalStatus?: string;
  residencyStatus?: string;
  isHead?: boolean;
  isStudent?: boolean;
  studentLevel?: string | null;
  isSpecialEducation?: boolean;
  employmentType?: string;
  employmentQuality?: string | null;
  educationLevel?: string;
  alimonyStatus?: string | null;
  isSonContributor?: boolean;
  sonMarried?: boolean;
  sonSameHouse?: boolean;
  isBride?: boolean;
  brideHasSponsor?: boolean;
  isOrphan?: boolean;
  isDisplaced?: boolean;
  isPrisoner?: boolean;
  prisonTerm?: string | null;
  prisonSuspicion?: string | null;
  diseases?: DiseaseDto[];
  disabilities?: DisabilityDto[];
}

export interface DiseaseDto {
  id: string;
  name?: string;
  treatmentCost: string;
  followup: string;
  workImpact: string;
}

export interface DisabilityDto {
  id: string;
  description?: string;
  workImpact: string;
  companion: string;
  treatmentCost: string;
}

export interface IncomeSourceDto {
  id: string;
  channel: string;
  monthlyAmount: string;
  verified: string;
  verificationNote?: string | null;
  verifiedAt?: string | null;
}

export interface TemporaryBurdenDto {
  id: string;
  type: string;
  grade?: string | null;
  description?: string | null;
}

export interface HouseholdDto {
  id: string;
  code: string;
  governorate: string;
  district: string;
  village: string;
  address?: string | null;
  addressRegion?: string | null;
  addressStreet?: string | null;
  addressDetails?: string | null;
  housingType: string;
  hasRationCard: boolean;
  hasFamilySupport: boolean;
  hasFoodAid: boolean;
  bankAssetGrade?: string | null;
  primaryPhone?: string | null;
  secondaryPhone?: string | null;
  backupPhone?: string | null;
  whatsappPhone?: string | null;
  socialStatus?: "MARRIED" | "DIVORCED" | "WIDOWED" | "WIDOWED_MARRIED" | "SINGLE_OTHER" | null;
  divorceYear?: string | null;
  divorceDocNumber?: string | null;
  marriageCount?: number | null;
  deathCertNumber?: string | null;
  deathDate?: string | null;
  registrationDate?: string | null;
  searchType?: "DESK" | "FIELD" | null;
  isModest?: boolean | null;
  officeDealings?: boolean | null;
  notes?: string | null;
  fieldNotes?: string | null;
  isDraft: boolean;
  lastDraftSavedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  persons?: PersonDto[];
  incomeSources?: IncomeSourceDto[];
  temporaryBurdens?: TemporaryBurdenDto[];
  scoreResults?: ScoreResultDto[];
  dependentCount?: number;
  totalPersons?: number;
  totalMembersCount?: number;
  totalMonthlyIncome?: number;
  latestClassification?: string | null;
  latestDecisionStatus?: string | null;
  latestScore?: ScoreResultDto | null;
  headName?: string | null;
  spouseName?: string | null;
  headNationalId?: string | null;
  spouseNationalId?: string | null;
  personTags?: {
    hasDiseases: boolean;
    hasDisabilities: boolean;
    hasStudent: boolean;
    hasBride: boolean;
    hasOrphan: boolean;
  };
  pdfUrl?: string | null;
}

export interface LayerBreakdownItem {
  layerId: string;
  score: string;
  cap?: string | number;
  cappedScore: string;
  triggeredRules?: Array<{
    ruleId: string;
    points?: string;
    label?: string;
    reasonCode?: string;
  }>;
  warnings?: string[];
}

export interface ScoreResultDto {
  id?: string;
  householdId?: string;
  systemRecommendation: EligibilityLevel;
  humanDecision?: string;
  classificationTag?: string | null;
  assistanceType?: string | null;
  reviewStatus?: string;
  decisionNote?: string | null;
  vulnerabilityScore: string | number;
  reductionScore: string | number;
  confidenceScore: string | number;
  fraudRiskScore: string | number;
  finalScore: string | number;
  normalizedPercent: string | number;
  scoreDelta?: string | number | null;
  layerBreakdown?: LayerBreakdownItem[];
  topPositiveFactors?: unknown[];
  topNegativeFactors?: unknown[];
  recommendations?: string[];
  warnings?: string[];
  calculatedAt?: string;
}

export interface SimulationResult {
  originalScore: {
    finalScore: string;
    normalizedPercent: number;
    systemRecommendation: EligibilityLevel;
  };
  simulatedScore: {
    finalScore: string;
    normalizedPercent: number;
    systemRecommendation: EligibilityLevel;
  };
  scoreDelta: number;
  affectedLayers: Array<{ layerId: string; before: string; after: string }>;
  explanation: {
    topPositiveFactors?: unknown[];
    topNegativeFactors?: unknown[];
    warnings?: string[];
    recommendations?: string[];
  };
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: PaginatedMeta;
  message?: string;
}
