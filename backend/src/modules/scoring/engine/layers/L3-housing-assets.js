/**
 * Layer 3: Housing & Assets
 *
 * Measures vulnerability from housing situation:
 * - Housing type (rent / shared / owned)
 * - Rent burden ratio (rent / income)
 *
 * Cap: LAYER_CAPS.L3_HOUSING_ASSETS
 */

const { ZERO, toDecimal, add, div, sum } = require('../../../../shared/utils/decimal');
const { L3, LAYER_CAPS } = require('../../../../shared/constants/weights');
const { createLayerResult, triggeredRule, skippedRule } = require('../layer-result');

function calculateL3(dto) {
  const rules = [];
  const skipped = [];
  const warnings = [];
  let total = ZERO;

  // ── Housing type scoring ──
  const housingType = dto.housingType;
  if (housingType === 'RENT') {
    rules.push(triggeredRule('L3_RENT', 'housing_rent', 'Family lives in rented housing', 'L3.RENT_WEIGHT', L3.RENT_WEIGHT, L3.RENT_WEIGHT));
    total = add(total, L3.RENT_WEIGHT);
  } else if (housingType === 'SHARED') {
    rules.push(triggeredRule('L3_SHARED', 'housing_shared', 'Family lives in shared housing', 'L3.SHARED_WEIGHT', L3.SHARED_WEIGHT, L3.SHARED_WEIGHT));
    total = add(total, L3.SHARED_WEIGHT);
  } else if (housingType === 'OWNED') {
    skipped.push(skippedRule('L3_OWNED', 'housing_owned', 'owned housing adds no vulnerability'));
  } else {
    warnings.push('Unknown housing type');
  }

  // ── Rent burden ratio ──
  if (housingType === 'RENT') {
    const rentValue = toDecimal(dto.rentValue);
    const totalIncome = sum((dto.incomes || []).map(i => toDecimal(i.amount)));

    if (totalIncome.greaterThan(0) && rentValue.greaterThan(0)) {
      const ratio = div(rentValue, totalIncome);
      if (ratio.greaterThan(L3.HIGH_RENT_BURDEN_THRESHOLD)) {
        rules.push(triggeredRule('L3_RENT_BURDEN', 'high_rent_burden', `High rent burden: rent/income = ${ratio.toFixed(2)}`, 'L3.HIGH_RENT_BURDEN_BONUS', L3.HIGH_RENT_BURDEN_BONUS, L3.HIGH_RENT_BURDEN_BONUS));
        total = add(total, L3.HIGH_RENT_BURDEN_BONUS);
      }
    } else if (totalIncome.isZero() && rentValue.greaterThan(0)) {
      // Paying rent with zero income — critical
      rules.push(triggeredRule('L3_RENT_BURDEN', 'rent_no_income', 'Paying rent with zero income', 'L3.HIGH_RENT_BURDEN_BONUS', L3.HIGH_RENT_BURDEN_BONUS, L3.HIGH_RENT_BURDEN_BONUS));
      total = add(total, L3.HIGH_RENT_BURDEN_BONUS);
    }
  }

  return createLayerResult('L3', total, LAYER_CAPS.L3_HOUSING_ASSETS, rules, skipped, warnings);
}

module.exports = { calculateL3 };
