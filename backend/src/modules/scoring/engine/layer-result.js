/**
 * LayerResult factory — enforces the contract interface.
 *
 * Every scoring layer MUST return a LayerResult.
 */

const { ZERO, toDecimal, min } = require('../../../shared/utils/decimal');

/**
 * @param {string} layerId    — e.g. 'L1', 'L2', …
 * @param {Decimal} score     — raw uncapped score
 * @param {Decimal} cap       — layer cap
 * @param {Array}  triggeredRules
 * @param {Array}  skippedRules
 * @param {Array}  warnings
 * @returns {LayerResult}
 */
function createLayerResult(layerId, score, cap, triggeredRules = [], skippedRules = [], warnings = []) {
  const rawScore = toDecimal(score);
  const cappedScore = min(rawScore, toDecimal(cap));

  return {
    layerId,
    score: rawScore,
    cap: toDecimal(cap),
    cappedScore,
    triggeredRules,
    skippedRules,
    warnings,
  };
}

/**
 * Create a triggered rule entry with full explainability.
 *
 * @param {string} ruleId - Unique rule identifier (e.g. 'L1_ORPHAN')
 * @param {string} reasonCode - Standardized short reason code
 * @param {string} humanReadableExplanation - Detailed explanation for the audit log
 * @param {string} weightSource - Reference to the constants/weights.js key used
 * @param {Decimal|number} rawContribution - The raw points before capping
 * @param {Decimal|number} cappedContribution - The final points after any internal rule caps
 */
function triggeredRule(ruleId, reasonCode, humanReadableExplanation, weightSource, rawContribution, cappedContribution) {
  return {
    ruleId,
    reasonCode,
    humanReadableExplanation,
    weightSource,
    rawContribution: toDecimal(rawContribution),
    cappedContribution: toDecimal(cappedContribution),
  };
}

/**
 * Create a skipped rule entry.
 */
function skippedRule(ruleId, label, reason) {
  return { ruleId, label, reason };
}

module.exports = { createLayerResult, triggeredRule, skippedRule };
