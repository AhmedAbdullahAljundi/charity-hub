/**
 * Layer 7: Reduction Engine
 *
 * Measures factors that OFFSET the vulnerability score:
 * - Government aid (Takaful/Karama)
 * - Charity assistance
 * - Family support
 * - Ration card
 * - Property income
 * - Smoker penalty
 *
 * Cap: LAYER_CAPS.L7_REDUCTION (max deduction)
 */

const { ZERO, toDecimal, add } = require('../../../../shared/utils/decimal');
const { L7, LAYER_CAPS } = require('../../../../shared/constants/weights');
const { createLayerResult, triggeredRule, skippedRule } = require('../layer-result');

function calculateL7(dto) {
  const rules = [];
  const skipped = [];
  const warnings = [];
  let total = ZERO;

  const incomes = dto.incomes || [];
  const members = dto.members || [];

  // ── Government aid: Takaful & Karama ──
  const hasTakaful = incomes.some(i =>
    i.sourceType === 'TAKAFUL_KARAMA' || i.source === 'تكافل وكرامة'
  );
  if (hasTakaful) {
    rules.push(triggeredRule(
      'L7_TAKAFUL', 
      'takaful_karama', 
      'Household receives Takaful/Karama government aid', 
      'L7.TAKAFUL_KARAMA_REDUCTION', 
      L7.TAKAFUL_KARAMA_REDUCTION, 
      L7.TAKAFUL_KARAMA_REDUCTION
    ));
    total = add(total, L7.TAKAFUL_KARAMA_REDUCTION);
  }

  // ── Charity aid ──
  const hasCharity = incomes.some(i =>
    i.sourceType === 'CHARITY' ||
    (i.source && i.source.includes('جمعية خيرية'))
  );
  if (hasCharity) {
    rules.push(triggeredRule(
      'L7_CHARITY', 
      'charity_aid', 
      'Household receives other charity aid', 
      'L7.CHARITY_AID_REDUCTION', 
      L7.CHARITY_AID_REDUCTION, 
      L7.CHARITY_AID_REDUCTION
    ));
    total = add(total, L7.CHARITY_AID_REDUCTION);
  }

  // ── Family support ──
  const hasFamilySupport = incomes.some(i =>
    i.sourceType === 'FAMILY_SUPPORT' ||
    (i.source && i.source.includes('مساعدات أهالي'))
  );
  if (hasFamilySupport) {
    rules.push(triggeredRule(
      'L7_FAMILY_SUPPORT', 
      'family_support', 
      'Household receives support from family/relatives', 
      'L7.FAMILY_SUPPORT_REDUCTION', 
      L7.FAMILY_SUPPORT_REDUCTION, 
      L7.FAMILY_SUPPORT_REDUCTION
    ));
    total = add(total, L7.FAMILY_SUPPORT_REDUCTION);
  }

  // ── Ration card ──
  const hasRation = incomes.some(i =>
    i.sourceType === 'RATION_CARD' ||
    (i.source && i.source.includes('بطاقة التموين'))
  );
  if (hasRation) {
    rules.push(triggeredRule(
      'L7_RATION', 
      'ration_card', 
      'Household has a government ration card', 
      'L7.RATION_CARD_REDUCTION', 
      L7.RATION_CARD_REDUCTION, 
      L7.RATION_CARD_REDUCTION
    ));
    total = add(total, L7.RATION_CARD_REDUCTION);
  }

  // ── Property income ──
  const hasProperty = incomes.some(i =>
    i.sourceType === 'PROPERTY' ||
    (i.source && i.source.includes('عقارات'))
  );
  if (hasProperty) {
    rules.push(triggeredRule(
      'L7_PROPERTY', 
      'property_income', 
      'Household has income from property/assets', 
      'L7.PROPERTY_INCOME_REDUCTION', 
      L7.PROPERTY_INCOME_REDUCTION, 
      L7.PROPERTY_INCOME_REDUCTION
    ));
    total = add(total, L7.PROPERTY_INCOME_REDUCTION);
  }

  // ── Smoker penalty ──
  const smokerCount = members.filter(m => m.smoker).length;
  if (smokerCount > 0) {
    const pts = toDecimal(L7.SMOKER_PENALTY).times(smokerCount);
    rules.push(triggeredRule(
      'L7_SMOKER', 
      'smoker_penalty', 
      `Smoker penalty for ${smokerCount} member(s)`, 
      'L7.SMOKER_PENALTY', 
      pts, 
      pts
    ));
    total = add(total, pts);
  }

  return createLayerResult('L7', total, LAYER_CAPS.L7_REDUCTION, rules, skipped, warnings);
}

module.exports = { calculateL7 };
