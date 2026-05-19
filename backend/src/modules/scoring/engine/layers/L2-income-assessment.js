/**
 * Layer 2: Income Assessment
 *
 * Measures vulnerability from income situation:
 * - Per-capita income vs poverty/low-income thresholds
 * - Income source diversity
 * - Verification status
 * - **Dependency-adjusted household size**: Handles double-counting by fractionally weighting
 *   members who already received high dependency points in L4.
 *
 * Cap: LAYER_CAPS.L2_INCOME_ASSESSMENT
 */

const { ZERO, ONE, toDecimal, add, div, sum, min, max } = require('../../../../shared/utils/decimal');
const { L2, LAYER_CAPS } = require('../../../../shared/constants/weights');
const { createLayerResult, triggeredRule, skippedRule } = require('../layer-result');

function calculateL2(dto) {
  const rules = [];
  const skipped = [];
  const warnings = [];

  const incomes = dto.incomes || [];
  let total = ZERO;

  // ── Dependency-Adjusted Household Size ──
  let denominator = ZERO;
  const now = new Date();

  for (const m of (dto.members || [])) {
    let weight = L2.DENOMINATOR_ADULT;
    
    // Age check
    const age = m.age != null ? m.age : (m.birthDate ? Math.floor((now - new Date(m.birthDate)) / 31557600000) : null);
    if (age != null && (age < 18 || age >= 60)) {
      weight = min(weight, L2.DENOMINATOR_DEPENDENT);
    }

    // Disability check
    if (m.disability) {
      if (m.disability === 'D' || m.disability === 'C') {
        weight = min(weight, L2.DENOMINATOR_SEVERE_DISABILITY);
      } else if (m.disability === 'B') {
        weight = min(weight, L2.DENOMINATOR_MODERATE_DISABILITY);
      }
    }

    // Chronic illness check
    if (m.medicalConditions) {
      for (const mc of m.medicalConditions) {
        if (mc.type === 'CHRONIC_DISEASE') {
          if (mc.diseaseSeverity === 'CRITICAL' || mc.diseaseSeverity === 'SEVERE') {
            weight = min(weight, L2.DENOMINATOR_SEVERE_DISABILITY);
          } else if (mc.diseaseSeverity === 'MODERATE') {
            weight = min(weight, L2.DENOMINATOR_MODERATE_DISABILITY);
          }
        }
      }
    }

    denominator = add(denominator, weight);
  }

  // Ensure denominator never drops below 1.0 to prevent artificial inflation or divide by zero
  denominator = max(denominator, ONE);

  // ── Per-capita income scoring ──
  const totalIncome = sum(incomes.map(i => toDecimal(i.amount)));
  const perCapita = div(totalIncome, denominator);

  let incomeScore = ZERO;
  if (perCapita.lessThanOrEqualTo(L2.POVERTY_LINE)) {
    incomeScore = L2.SCORE_BELOW_POVERTY;
    rules.push(triggeredRule(
      'L2_POVERTY', 
      'below_poverty_line', 
      `Below poverty line: per capita ${perCapita.toFixed(2)} EGP (adjusted size: ${denominator.toFixed(2)})`, 
      'L2.SCORE_BELOW_POVERTY', 
      incomeScore, 
      incomeScore
    ));
  } else if (perCapita.lessThanOrEqualTo(L2.LOW_INCOME_LINE)) {
    incomeScore = L2.SCORE_LOW_INCOME;
    rules.push(triggeredRule(
      'L2_LOW_INCOME', 
      'low_income', 
      `Low income: per capita ${perCapita.toFixed(2)} EGP (adjusted size: ${denominator.toFixed(2)})`, 
      'L2.SCORE_LOW_INCOME', 
      incomeScore, 
      incomeScore
    ));
  } else if (perCapita.lessThanOrEqualTo(L2.MEDIUM_INCOME_LINE)) {
    incomeScore = L2.SCORE_MEDIUM_INCOME;
    rules.push(triggeredRule(
      'L2_MEDIUM_INCOME', 
      'medium_income', 
      `Medium income: per capita ${perCapita.toFixed(2)} EGP (adjusted size: ${denominator.toFixed(2)})`, 
      'L2.SCORE_MEDIUM_INCOME', 
      incomeScore, 
      incomeScore
    ));
  } else {
    incomeScore = L2.SCORE_ABOVE_MEDIUM;
    skipped.push(skippedRule('L2_INCOME', 'above_medium_income', 'income exceeds medium threshold'));
  }
  total = add(total, incomeScore);

  // ── Zero income ──
  if (totalIncome.isZero() && incomes.length === 0) {
    rules.push(triggeredRule(
      'L2_NO_INCOME', 
      'no_income_sources', 
      'No income sources declared', 
      'L2.SCORE_BELOW_POVERTY', 
      L2.SCORE_BELOW_POVERTY, 
      L2.SCORE_BELOW_POVERTY
    ));
    total = add(total, L2.SCORE_BELOW_POVERTY);
  }

  // ── Single source penalty ──
  if (incomes.length === 1) {
    rules.push(triggeredRule(
      'L2_SINGLE_SRC', 
      'single_income_source', 
      'High risk from single income source', 
      'L2.SINGLE_SOURCE_PENALTY', 
      L2.SINGLE_SOURCE_PENALTY, 
      L2.SINGLE_SOURCE_PENALTY
    ));
    total = add(total, L2.SINGLE_SOURCE_PENALTY);
  }

  // ── Unverified income ──
  const verifiedCount = incomes.filter(i => i.verified).length;
  if (incomes.length > 0 && verifiedCount === 0) {
    rules.push(triggeredRule(
      'L2_UNVERIFIED', 
      'no_verified_income', 
      'All declared income sources are unverified', 
      'L2.UNVERIFIED_PENALTY', 
      L2.UNVERIFIED_PENALTY, 
      L2.UNVERIFIED_PENALTY
    ));
    total = add(total, L2.UNVERIFIED_PENALTY);
  }

  return createLayerResult('L2', total, LAYER_CAPS.L2_INCOME_ASSESSMENT, rules, skipped, warnings);
}

module.exports = { calculateL2 };
