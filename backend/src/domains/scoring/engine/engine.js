/**
 * Phase 2 scoring engine — runs on NormalizedHouseholdInput (no Prisma).
 */

const { toDecimal } = require('../../../shared/utils/decimal');
const { HumanDecision, ReviewStatus } = require('../../../shared/constants/enums');
const { ScoringEngineError } = require('../../../shared/errors');
const { resolveStatic } = require('../registry/ruleRegistry');
const { runVulnerabilityEngine } = require('./sub-engines/vulnerability-engine');
const { runReductionEngine } = require('./sub-engines/reduction-engine');
const { runConfidenceEngine } = require('./sub-engines/confidence-engine');
const { evaluateFraud } = require('./fraud/fraud-engine');
const { aggregate } = require('./aggregator');
const { explain } = require('./explainer');
const { buildSnapshot } = require('./snapshot-builder');

const { performance } = require('perf_hooks');

/**
 * @param {import('./normalizer').NormalizedHouseholdInput} input
 * @param {{ weights?: { get: Function, snapshot: object } }} options
 */
function runScoringEngine(input, options = {}) {
  const t0 = performance.now();
  if (!input || !input.householdId) {
    throw new ScoringEngineError('Invalid input: missing householdId');
  }

  const weights = options.weights ?? resolveStatic();

  const ctx = {
    input: JSON.parse(JSON.stringify(input)),
    weights,
    layerResults: [],
    incomeAdjustment: null,
    confidenceScore: null,
    fraudRiskFromL8: null,
    l8Warnings: [],
  };

  for (const p of ctx.input.persons) {
    p.markedAsL4Processed = false;
  }

  try {
    const vulnResult = runVulnerabilityEngine(ctx);
    const reductionResult = runReductionEngine(ctx);
    const confidenceResult = runConfidenceEngine(ctx);
    const aggregated = aggregate(ctx, vulnResult, reductionResult, confidenceResult);
    const fraud = evaluateFraud(ctx, aggregated);
    const explained = explain(aggregated, ctx);

    const reviewStatus = fraud.reviewStatus ?? aggregated.reviewStatus;
    const recommendations = [
      ...explained.recommendations,
      ...fraud.recommendations,
    ];
    const warnings = [...explained.warnings, ...fraud.warnings];

    const snapshot = buildSnapshot(ctx, explained);

    const serializedBreakdown = ctx.layerResults.map((l) => ({
      layerId: l.layerId,
      score: l.score.toFixed(4),
      cappedScore: l.cappedScore.toFixed(4),
      triggeredRules: l.triggeredRules.map((r) => ({
        ruleId: r.ruleId,
        reasonCode: r.reasonCode,
        label: r.humanReadableExplanation,
        points: toDecimal(r.cappedContribution).toFixed(4),
        detail: r.weightSource || '',
      })),
      skippedRules: (l.skippedRules || []).map((r) => ({
        ruleId: r.ruleId,
        label: r.label,
        reason: r.reason,
      })),
      warnings: l.warnings,
    }));

    const t1 = performance.now();
    const executionMs = Number((t1 - t0).toFixed(2));

    return {
      systemRecommendation: aggregated.systemRecommendation,
      humanDecision: HumanDecision.PENDING,
      reviewStatus,
      vulnerabilityScore: aggregated.vulnerabilityScore,
      reductionScore: aggregated.reductionScore,
      confidenceScore: aggregated.confidenceScore,
      fraudRiskScore: fraud.fraudRiskScore,
      finalScore: aggregated.finalScore,
      normalizedPercent: aggregated.normalizedPercent,
      incomeAdjustment: aggregated.incomeAdjustment,
      layerBreakdown: serializedBreakdown,
      topPositiveFactors: explained.topPositiveFactors,
      topNegativeFactors: explained.topNegativeFactors,
      recommendations,
      warnings,
      snapshot,
      calculationSnapshot: snapshot,
      rawInputSnapshot: input,
      weightsSnapshot: weights.snapshot,
      executionMs,
    };
  } catch (error) {
    if (error instanceof ScoringEngineError) throw error;
    throw new ScoringEngineError(`Engine execution failed: ${error.message}`);
  }
}

module.exports = { runScoringEngine };
