/**
 * Layer 6: Social Status
 *
 * Measures vulnerability from social category:
 * - Maps the family's declared social status to a vulnerability score
 *
 * Cap: LAYER_CAPS.L6_SOCIAL_STATUS
 */

const { ZERO, toDecimal, add } = require('../../../../shared/utils/decimal');
const { L6, LAYER_CAPS } = require('../../../../shared/constants/weights');
const { createLayerResult, triggeredRule, skippedRule } = require('../layer-result');

/** Map SocialStatus enum → weight */
const STATUS_WEIGHTS = {
  ORPHANS: L6.ORPHANS,
  DIVORCED: L6.DIVORCED,
  POOR: L6.POOR,
  NEEDY: L6.NEEDY,
  DISABILITY: L6.DISABILITY_STATUS,
  STUDENT: L6.STUDENT,
  PRISONER: L6.PRISONER,
  ELDERLY: L6.ELDERLY,
  ABANDONMENT: L6.ABANDONMENT,
  CHRONIC_DISEASE: L6.CHRONIC_DISEASE,
  TEMPORARY_INJURY: L6.TEMPORARY_INJURY,
  OTHER: L6.OTHER,
};

function calculateL6(dto) {
  const rules = [];
  const skipped = [];
  const warnings = [];
  let total = ZERO;

  const socialStatus = dto.socialStatus;

  if (!socialStatus) {
    skipped.push(skippedRule('L6_STATUS', 'social_status', 'no social status declared'));
    return createLayerResult('L6', ZERO, LAYER_CAPS.L6_SOCIAL_STATUS, rules, skipped, warnings);
  }

  const weight = STATUS_WEIGHTS[socialStatus];
  if (weight) {
    rules.push(triggeredRule(
      'L6_STATUS', 
      'social_status', 
      `Social status mapped to: ${socialStatus}`, 
      `L6.${socialStatus}`, 
      weight, 
      weight
    ));
    total = add(total, weight);
  } else {
    warnings.push(`Unknown social status: ${socialStatus}`);
    rules.push(triggeredRule(
      'L6_STATUS', 
      'social_status_unknown', 
      `Unknown or undefined social status: ${socialStatus}`, 
      'L6.OTHER', 
      L6.OTHER, 
      L6.OTHER
    ));
    total = add(total, L6.OTHER);
  }

  return createLayerResult('L6', total, LAYER_CAPS.L6_SOCIAL_STATUS, rules, skipped, warnings);
}

module.exports = { calculateL6 };
