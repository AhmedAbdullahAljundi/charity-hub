/**
 * Immutable scoring output contract (Master Spec).
 * Persisted via ScoreResult; engine returns this shape.
 */

import type { Decimal } from 'decimal.js';
import type {
  EligibilityLevel,
  HumanDecision,
  ReviewStatus,
} from '@prisma/client';

export interface TriggeredRule {
  ruleId: string;
  weight: Decimal;
  descriptionKey: string;
}

export interface SkippedRule {
  ruleId: string;
  reasonKey: string;
}

export interface LayerResult {
  layerId: string;
  score: Decimal;
  cappedScore: Decimal;
  triggeredRules: TriggeredRule[];
  skippedRules: SkippedRule[];
  warnings: string[];
}

export interface ScoreItem {
  factorKey: string;
  weight: Decimal;
  layerId: string;
}

export interface CalculationSnapshot {
  engineVersion: string;
  ruleVersion: string;
  calculatedAt: string;
  inputHash: string;
}

export interface ScoringResult {
  systemRecommendation: EligibilityLevel;
  humanDecision: HumanDecision;
  reviewStatus: ReviewStatus;
  vulnerabilityScore: Decimal;
  reductionScore: Decimal;
  confidenceScore: Decimal;
  fraudRiskScore: Decimal;
  finalScore: Decimal;
  normalizedPercent: Decimal;
  layerBreakdown: LayerResult[];
  topPositiveFactors: ScoreItem[];
  topNegativeFactors: ScoreItem[];
  recommendations: string[];
  warnings: string[];
  snapshot: CalculationSnapshot;
  scoreDelta?: Decimal;
}
