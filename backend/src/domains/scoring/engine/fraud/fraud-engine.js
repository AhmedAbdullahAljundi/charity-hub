const { ZERO, toDecimal, add, sum } = require('../../../../shared/utils/decimal');
const { ReviewStatus } = require('../../../../shared/constants/enums');

const ABROAD_TYPES = new Set(['ABROAD_WEAK', 'ABROAD_MEDIUM', 'ABROAD_REGULAR']);

function evaluateFraud(ctx, aggregated) {
  const { input } = ctx;
  const warnings = [];
  const recommendations = [];
  let fraudRiskScore = toDecimal(ctx.fraudRiskFromL8 ?? 0);

  const totalIncome = sum(input.incomeSources.map((s) => s.monthlyAmount));
  const vulnerabilityScore = aggregated.vulnerabilityScore;
  const reductionScore = aggregated.reductionScore;

  if (
    totalIncome.greaterThan(3000) &&
    vulnerabilityScore.greaterThan(10)
  ) {
    fraudRiskScore = add(fraudRiskScore, '0.2');
    warnings.push('HIGH_INCOME_HIGH_SCORE_CONTRADICTION');
  }

  if (
    !input.hasRationCard &&
    input.bankAssetGrade &&
    ['D', 'E', 'F'].includes(input.bankAssetGrade)
  ) {
    fraudRiskScore = add(fraudRiskScore, '0.2');
    warnings.push('NO_RATION_BUT_ASSETS');
  }

  const hasAbroadSon = input.persons.some(
    (p) => p.isSonContributor && ABROAD_TYPES.has(p.employmentType)
  );
  if (hasAbroadSon && reductionScore.isZero()) {
    fraudRiskScore = add(fraudRiskScore, '0.15');
    warnings.push('ABROAD_SON_NO_CORRECTION');
  }

  const hasSevereDebt = input.temporaryBurdens.some(
    (b) => b.type === 'DEBT' && b.grade === 'D'
  );
  if (totalIncome.greaterThan(2000) && hasSevereDebt) {
    fraudRiskScore = add(fraudRiskScore, '0.15');
    warnings.push('HIGH_INCOME_SEVERE_DEBT');
  }

  let reviewStatus = aggregated.reviewStatus;
  if (fraudRiskScore.greaterThan('0.4')) {
    reviewStatus = ReviewStatus.FIELD_VISIT_REQUIRED;
    recommendations.push('RECOMMEND_FIELD_VISIT');
  }

  const verifiedRatio = toDecimal(input.flags.totalVerifiedSources).div(8);
  if (verifiedRatio.lessThan('0.375')) {
    reviewStatus = ReviewStatus.FIELD_VISIT_REQUIRED;
    warnings.push('LOW_CONFIDENCE_REVIEW');
  }

  return { fraudRiskScore, warnings, recommendations, reviewStatus };
}

module.exports = { evaluateFraud };
