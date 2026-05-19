/**
 * Scoring Repository
 *
 * Isolates ALL Prisma database calls for scoring.
 * Controllers and services never touch Prisma directly for scoring data.
 */

const prisma = require('../../config/prisma');
const { toDecimal } = require('../../shared/utils/decimal');

const scoringRepository = {
  /**
   * Persist a full scoring result inside a transaction.
   * Never partially persists scoring results.
   */
  async persistScoringResult(familyId, result, tx = null) {
    const client = tx || prisma;

    return client.scoring.create({
      data: {
        family_id: familyId,
        // Legacy fields
        total_need: toDecimal(result.vulnerabilityScore).toFixed(4),
        total_income: toDecimal(0).toFixed(4), // not directly used anymore
        vulnerability_index: toDecimal(result.normalizedPercent).dividedBy(10).toFixed(4),
        classification: result.legacyClassification || 'MODERATE',
        breakdown: result.layerBreakdown,
        // New 4-engine fields
        system_recommendation: result.systemRecommendation,
        human_decision: result.humanDecision || 'PENDING',
        review_status: result.reviewStatus || 'PENDING_REVIEW',
        vulnerability_score: toDecimal(result.vulnerabilityScore).toFixed(4),
        reduction_score: toDecimal(result.reductionScore).toFixed(4),
        confidence_score: toDecimal(result.confidenceScore).toFixed(4),
        fraud_risk_score: toDecimal(result.fraudRiskScore).toFixed(4),
        final_score: toDecimal(result.finalScore).toFixed(4),
        normalized_percent: toDecimal(result.normalizedPercent).toFixed(2),
        layer_breakdown: result.layerBreakdown,
        top_positive_factors: result.topPositiveFactors,
        top_negative_factors: result.topNegativeFactors,
        recommendations: result.recommendations,
        warnings: result.warnings,
        snapshot: result.snapshot,
        score_delta: result.scoreDelta ? toDecimal(result.scoreDelta).toFixed(4) : null,
      },
    });
  },

  /**
   * Get the latest scoring record for a family.
   */
  async getLatestScore(familyId) {
    return prisma.scoring.findFirst({
      where: { family_id: familyId },
      orderBy: { calculated_at: 'desc' },
    });
  },

  /**
   * Get scoring history for a family.
   */
  async getScoreHistory(familyId, limit = 10) {
    return prisma.scoring.findMany({
      where: { family_id: familyId },
      orderBy: { calculated_at: 'desc' },
      take: limit,
    });
  },

  /**
   * Record a human decision on a scoring record.
   * Must be done inside a transaction.
   */
  async recordHumanDecision(scoringId, decision, notes, userId, tx = null) {
    const client = tx || prisma;

    return client.scoring.update({
      where: { id: scoringId },
      data: {
        human_decision: decision,
        review_status: 'COMPLETED',
        decision_notes: notes || null,
        decided_by: userId || null,
      },
    });
  },

  /**
   * Fetch family with all relations needed for scoring.
   */
  async fetchFamilyForScoring(familyId, tx = null) {
    const client = tx || prisma;

    const family = await client.family.findUnique({
      where: { id: familyId },
      include: {
        persons: {
          include: {
            medicalCases: true,
            educationRecords: true,
          },
        },
        incomes: true,
        expenses: true,
      },
    });

    return family;
  },
};

module.exports = scoringRepository;
