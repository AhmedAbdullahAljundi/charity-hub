/**
 * Layer 4: Health & Disability
 *
 * Measures vulnerability from health conditions:
 * - Disability by category (A/B/C/D)
 * - Chronic disease severity
 * - Medical cost burden
 * - Multiple conditions with diminishing returns
 *
 * Cap: LAYER_CAPS.L4_HEALTH_DISABILITY
 */

const { ZERO, toDecimal, add, mul, div, sum, pow } = require('../../../../shared/utils/decimal');
const { L4, LAYER_CAPS } = require('../../../../shared/constants/weights');
const { createLayerResult, triggeredRule, skippedRule } = require('../layer-result');

function calculateL4(dto) {
  const rules = [];
  const skipped = [];
  const warnings = [];
  let total = ZERO;

  const members = dto.members || [];
  const medicalCases = dto.medicalCases || [];

  if (medicalCases.length === 0 && !members.some(m => m.disability)) {
    skipped.push(skippedRule('L4_NONE', 'no_health_issues', 'no medical cases or disabilities'));
    return createLayerResult('L4', ZERO, LAYER_CAPS.L4_HEALTH_DISABILITY, rules, skipped, warnings);
  }

  // ── Disability scoring from members ──
  const disabledMembers = members.filter(m => m.disability);
  for (const member of disabledMembers) {
    const memberCases = medicalCases.filter(mc => mc.personId === member.id);
    const disabilityCase = memberCases.find(mc => mc.medicalCategory);
    const category = disabilityCase ? disabilityCase.medicalCategory : null;

    let pts, weightSrc;
    switch (category) {
      case 'D': pts = L4.DISABILITY_D; weightSrc = 'L4.DISABILITY_D'; break;
      case 'C': pts = L4.DISABILITY_C; weightSrc = 'L4.DISABILITY_C'; break;
      case 'B': pts = L4.DISABILITY_B; weightSrc = 'L4.DISABILITY_B'; break;
      case 'A': pts = L4.DISABILITY_A; weightSrc = 'L4.DISABILITY_A'; break;
      default: pts = L4.DISABILITY_B; weightSrc = 'L4.DISABILITY_B'; break;
    }
    rules.push(triggeredRule(
      'L4_DISABILITY', 
      'disability', 
      `Disability for ${member.name} (Category ${category || 'unknown'})`, 
      weightSrc, 
      pts, 
      pts
    ));
    total = add(total, pts);
  }

  // ── Chronic disease scoring ──
  let conditionIndex = 0;
  for (const mc of medicalCases) {
    if (!mc.chronic) continue;

    let basePts, weightSrc;
    switch (mc.diseaseSeverity) {
      case 'CRITICAL': basePts = L4.CHRONIC_CRITICAL; weightSrc = 'L4.CHRONIC_CRITICAL'; break;
      case 'SEVERE': basePts = L4.CHRONIC_SEVERE; weightSrc = 'L4.CHRONIC_SEVERE'; break;
      case 'MODERATE': basePts = L4.CHRONIC_MODERATE; weightSrc = 'L4.CHRONIC_MODERATE'; break;
      case 'MILD': basePts = L4.CHRONIC_MILD; weightSrc = 'L4.CHRONIC_MILD'; break;
      default: basePts = L4.CHRONIC_MILD; weightSrc = 'L4.CHRONIC_MILD'; break;
    }

    // Diminishing returns for multiple conditions using safe decimal pow
    const factor = conditionIndex === 0
      ? toDecimal(1)
      : mul(L4.ADDITIONAL_CONDITION_FACTOR, pow(0.7, conditionIndex - 1));
      
    const pts = mul(basePts, factor);

    rules.push(triggeredRule(
      'L4_CHRONIC', 
      'chronic_disease', 
      `Chronic disease: ${mc.diseaseName} (Severity: ${mc.diseaseSeverity || 'unknown'})`, 
      weightSrc, 
      pts, 
      pts
    ));
    total = add(total, pts);
    conditionIndex++;
  }

  // ── Medical cost burden ──
  const totalTreatmentCost = sum(medicalCases.map(mc => toDecimal(mc.treatmentCost)));
  const totalIncome = sum((dto.incomes || []).map(i => toDecimal(i.amount)));

  if (totalIncome.greaterThan(0) && totalTreatmentCost.greaterThan(0)) {
    const costRatio = div(totalTreatmentCost, totalIncome);
    if (costRatio.greaterThan(L4.COST_BURDEN_THRESHOLD)) {
      rules.push(triggeredRule(
        'L4_COST_BURDEN', 
        'medical_cost_burden', 
        `High medical cost burden: cost/income = ${costRatio.toFixed(2)}`, 
        'L4.COST_BURDEN_BONUS', 
        L4.COST_BURDEN_BONUS, 
        L4.COST_BURDEN_BONUS
      ));
      total = add(total, L4.COST_BURDEN_BONUS);
    }
  }

  return createLayerResult('L4', total, LAYER_CAPS.L4_HEALTH_DISABILITY, rules, skipped, warnings);
}

module.exports = { calculateL4 };
