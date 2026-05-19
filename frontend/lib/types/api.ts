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
  gender: string;
  birthDate: string;
  role: string;
  maritalStatus?: string;
  residencyStatus?: string;
  isHead?: boolean;
  isStudent?: boolean;
  studentLevel?: string | null;
  employmentType?: string;
  employmentQuality?: string | null;
  educationLevel?: string;
  alimonyStatus?: string | null;
  isSonContributor?: boolean;
  sonMarried?: boolean;
  sonSameHouse?: boolean;
  isBride?: boolean;
  brideHasSponsor?: boolean;
  isPrisoner?: boolean;
  prisonTerm?: string | null;
  prisonSuspicion?: string | null;
  isOrphan?: boolean;
  diseases?: DiseaseDto[];
  disabilities?: DisabilityDto[];
}

export interface DiseaseDto {
  id: string;
  treatmentCost: string;
  followup: string;
  workImpact: string;
}

export interface DisabilityDto {
  id: string;
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
}

export interface HouseholdDto {
  id: string;
  code: string;
  governorate: string;
  district: string;
  village: string;
  address?: string | null;
  housingType: string;
  hasRationCard: boolean;
  hasFamilySupport: boolean;
  hasFoodAid: boolean;
  bankAssetGrade?: string | null;
  notes?: string | null;
  isDraft: boolean;
  lastDraftSavedAt?: string | null;
  persons?: PersonDto[];
  incomeSources?: IncomeSourceDto[];
  temporaryBurdens?: TemporaryBurdenDto[];
  scoreResults?: ScoreResultDto[];
}

export interface LayerBreakdownItem {
  layerId: string;
  score: string;
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
