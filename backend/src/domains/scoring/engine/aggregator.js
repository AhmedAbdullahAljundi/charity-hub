const { sum } = require('../../../shared/utils/decimal');
const { HumanDecision, ReviewStatus } = require('../../../shared/constants/enums');
const { normalizeScore } = require('./score-normalizer');

function aggregate(ctx, vulnResult, reductionResult, confidenceResult) {
  const vulnerabilityScore = vulnResult.vulnerabilityScore;
  const reductionScore = reductionResult.reductionScore;
  const incomeAdjustment = confidenceResult.incomeAdjustment;
  const confidenceScore = confidenceResult.confidenceScore;

  const rawTotal = sum([vulnerabilityScore, reductionScore, incomeAdjustment]);
  const { normalizedPercent, eligibilityLevel: systemRecommendation } =
    normalizeScore(rawTotal);

  return {
    vulnerabilityScore,
    reductionScore,
    incomeAdjustment,
    confidenceScore,
    finalScore: rawTotal,
    normalizedPercent,
    systemRecommendation,
    humanDecision: HumanDecision.PENDING,
    reviewStatus: ReviewStatus.SCORE_READY,
  };
}

module.exports = { aggregate };
