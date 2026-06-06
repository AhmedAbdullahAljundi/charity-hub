const prisma = require('../../../config/prisma');
const { toDecimal } = require('../../../shared/utils/decimal');

const scoringRepository = {
  async getLatestScore(householdId) {
    return prisma.scoreResult.findFirst({
      where: { householdId },
      orderBy: { calculatedAt: 'desc' },
    });
  },

  async saveResult(householdId, result, meta = {}) {
    const previous = await this.getLatestScore(householdId);
    const previousScore = previous ? toDecimal(previous.finalScore) : null;
    const finalScore = toDecimal(result.finalScore);
    const scoreDelta = previousScore ? finalScore.minus(previousScore) : null;

    return prisma.scoreResult.create({
      data: {
        householdId,
        engineVersion: meta.engineVersion || result.snapshot?.engineVersion || '2.0.0',
        ruleVersion: meta.ruleVersion || result.snapshot?.ruleVersion || '2024-01',
        weightsSnapshot: result.weightsSnapshot || result.snapshot?.weightsSnapshot || {},
        vulnerabilityScore: toDecimal(result.vulnerabilityScore).toFixed(4),
        reductionScore: toDecimal(result.reductionScore).toFixed(4),
        confidenceScore: toDecimal(result.confidenceScore).toFixed(3),
        fraudRiskScore: toDecimal(result.fraudRiskScore).toFixed(3),
        finalScore: finalScore.toFixed(4),
        normalizedPercent: toDecimal(result.normalizedPercent).toFixed(3),
        systemRecommendation: result.systemRecommendation,
        previousScore: previousScore ? previousScore.toFixed(4) : null,
        scoreDelta: scoreDelta ? scoreDelta.toFixed(4) : null,
        calculationSnapshot: result.calculationSnapshot || result.snapshot,
        layerBreakdown: result.layerBreakdown,
        topPositiveFactors: result.topPositiveFactors,
        topNegativeFactors: result.topNegativeFactors,
        recommendations: result.recommendations,
        warnings: result.warnings,
        rawInputSnapshot: result.rawInputSnapshot,
      },
    });
  },
};

module.exports = scoringRepository;
