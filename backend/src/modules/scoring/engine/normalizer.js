/**
 * Facade: household normalization + legacy score normalization export.
 */
const householdNormalizer = require('../../../domains/scoring/engine/normalizer');
const { normalizeScore } = require('../../../domains/scoring/engine/score-normalizer');
const { EligibilityLevel } = require('../../../shared/constants/enums');

function toLegacyClassification(level) {
  switch (level) {
    case EligibilityLevel.CRITICAL:
      return 'VERY_FRAGILE';
    case EligibilityLevel.HIGH_NEED:
      return 'FRAGILE';
    case EligibilityLevel.MODERATE_NEED:
      return 'WEAK';
    case EligibilityLevel.LOW_NEED:
      return 'MODERATE';
    case EligibilityLevel.NOT_ELIGIBLE:
      return 'OUT_OF_PRIORITY';
    default:
      return 'MODERATE';
  }
}

module.exports = {
  ...householdNormalizer,
  normalize: normalizeScore,
  toLegacyClassification,
};
