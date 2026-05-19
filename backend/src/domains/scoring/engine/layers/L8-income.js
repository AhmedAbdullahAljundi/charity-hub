const { ZERO, sum, toDecimal, div, mul, add } = require('../../../../shared/utils/decimal');
const { WEIGHTS, LAYER_CAPS } = require('../../registry/weights');
const { createLayerResult, triggeredRule } = require('../utils/layer-helpers');

/**
 * L8 — income adjustment + confidence (confidence stored on ctx).
 */
function calculateL8(ctx) {
  const { input, weights } = ctx;
  const rules = [];
  const warnings = [];

  const totalIncome = sum(input.incomeSources.map((s) => s.monthlyAmount));
  const divisor = WEIGHTS.INCOME.DIVISOR;
  let incomeScore = div(add(totalIncome, 1), divisor);

  rules.push(
    triggeredRule(
      'income_divisor_score',
      'rules.income_divisor',
      `Income score from total ${totalIncome.toFixed(2)}`,
      'WEIGHTS.INCOME.DIVISOR',
      incomeScore,
      incomeScore
    )
  );

  const verifiedCount = input.flags.totalVerifiedSources;
  const pensionExists = input.flags.pensionRecordExists;
  const pensionVerified = input.flags.pensionVerified;
  const totalChannels = WEIGHTS.INCOME.TOTAL_CHANNELS;

  let confidenceScore;
  let fraudBump = ZERO;

  if (verifiedCount < 3 || (pensionExists && !pensionVerified)) {
    const penalty = weights.get('income_low_verify', WEIGHTS.INCOME.PENALTY_LOW_VERIFY);
    incomeScore = add(incomeScore, penalty);
    fraudBump = toDecimal('0.3');
    confidenceScore = div(verifiedCount, totalChannels);
    warnings.push('LOW_VERIFICATION_PENALTY');
    rules.push(
      triggeredRule(
        'income_low_verify',
        'rules.income_low_verify',
        'Low verification penalty',
        'WEIGHTS.INCOME.PENALTY_LOW_VERIFY',
        penalty,
        penalty
      )
    );
  } else {
    const verificationRatio = div(verifiedCount, totalChannels);
    const adjustmentFactor = subFromTwo(verificationRatio);
    incomeScore = mul(incomeScore, adjustmentFactor);
    confidenceScore = verificationRatio;
    rules.push(
      triggeredRule(
        'income_verify_adjustment',
        'rules.income_verify_adjust',
        `Verification ratio ${verificationRatio.toFixed(3)}`,
        'WEIGHTS.INCOME',
        incomeScore,
        incomeScore
      )
    );
  }

  const l8Floor = toDecimal(LAYER_CAPS.L8_INCOME).negated();
  if (incomeScore.lessThan(l8Floor)) {
    incomeScore = l8Floor;
  }

  ctx.incomeAdjustment = incomeScore;
  ctx.confidenceScore = confidenceScore;
  ctx.fraudRiskFromL8 = fraudBump;
  ctx.l8Warnings = warnings;

  const result = createLayerResult('L8', incomeScore, LAYER_CAPS.L8_INCOME, rules, [], warnings);
  result.cappedScore = incomeScore;
  result.score = incomeScore;
  return result;
}

function subFromTwo(verificationRatio) {
  return toDecimal(2).minus(verificationRatio);
}

module.exports = { calculateL8 };
