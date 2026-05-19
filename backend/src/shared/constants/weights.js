/**
 * Re-exports Phase 2 WEIGHTS from domains/scoring (single source of truth).
 * Legacy layer files may import from here until fully migrated.
 */

const { WEIGHTS, LAYER_CAPS } = require('../../domains/scoring/registry/weights');
const { toDecimal } = require('../utils/decimal');

/** @deprecated Use LAYER_CAPS from domains — legacy alias map for old tests */
const LEGACY_LAYER_CAPS = Object.freeze({
  L1_FAMILY_COMPOSITION: toDecimal(LAYER_CAPS.L1_HEAD),
  L2_INCOME_ASSESSMENT: toDecimal('30'),
  L3_HOUSING_ASSETS: toDecimal(LAYER_CAPS.L5B_HOUSING),
  L4_HEALTH_DISABILITY: toDecimal(LAYER_CAPS.L6_HEALTH),
  L5_EDUCATION: toDecimal(LAYER_CAPS.L3_STUDENTS),
  L6_SOCIAL_STATUS: toDecimal(LAYER_CAPS.L4_VULNERABILITY),
  L7_REDUCTION: toDecimal(LAYER_CAPS.L7_CORRECTIONS).abs(),
  L8_CONFIDENCE: toDecimal('1'),
});

const NORMALIZATION = Object.freeze({
  MAX_RAW_SCORE: toDecimal(LAYER_CAPS.THEORETICAL_MAX),
  CRITICAL_THRESHOLD: toDecimal('80'),
  HIGH_THRESHOLD: toDecimal('60'),
  MEDIUM_THRESHOLD: toDecimal('40'),
  LOW_THRESHOLD: toDecimal('20'),
});

module.exports = {
  WEIGHTS,
  LAYER_CAPS,
  NORMALIZATION,
  LEGACY_LAYER_CAPS,
};
