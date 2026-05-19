/**
 * Maps raw total score → normalized percent + eligibility level (Phase 2 thresholds).
 */

const { ZERO, toDecimal, div, mul, max } = require('../../../shared/utils/decimal');
const { LAYER_CAPS } = require('../registry/weights');
const { EligibilityLevel } = require('../../../shared/constants/enums');
const { NormalizationError } = require('../../../shared/errors');

function normalizeScore(rawScore) {
  const score = toDecimal(rawScore);
  const theoreticalMax = toDecimal(LAYER_CAPS.THEORETICAL_MAX);
  if (theoreticalMax.isZero()) {
    throw new NormalizationError('THEORETICAL_MAX cannot be zero');
  }

  const normalizedPercent = max(mul(div(score, theoreticalMax), 100), ZERO);

  const pct = normalizedPercent.toNumber();
  let eligibilityLevel;
  if (pct >= 80) eligibilityLevel = EligibilityLevel.CRITICAL;
  else if (pct >= 60) eligibilityLevel = EligibilityLevel.HIGH_NEED;
  else if (pct >= 40) eligibilityLevel = EligibilityLevel.MODERATE_NEED;
  else if (pct >= 20) eligibilityLevel = EligibilityLevel.LOW_NEED;
  else eligibilityLevel = EligibilityLevel.NOT_ELIGIBLE;

  return { normalizedPercent, eligibilityLevel };
}

module.exports = { normalizeScore };
