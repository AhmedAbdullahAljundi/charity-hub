/**
 * Fraud Rule 2: Duplicate Benefits
 *
 * Flags when household receives multiple aid sources
 * that typically shouldn't overlap (e.g. Takaful + charity + family support).
 *
 * Returns a risk score 0–1.
 */

const { ZERO, toDecimal } = require('../../../../../shared/utils/decimal');

const AID_SOURCE_TYPES = new Set([
  'TAKAFUL_KARAMA', 'CHARITY', 'FAMILY_SUPPORT', 'AID',
]);

const AID_ARABIC_PATTERNS = [
  'تكافل وكرامة', 'جمعية خيرية', 'مساعدات أهالي', 'مساعدات غذائية',
];

function evaluateFR2(dto) {
  const incomes = dto.incomes || [];

  let aidSourceCount = 0;

  for (const income of incomes) {
    const isAid = AID_SOURCE_TYPES.has(income.sourceType) ||
      AID_ARABIC_PATTERNS.some(p => (income.source || '').includes(p));
    if (isAid) aidSourceCount++;
  }

  if (aidSourceCount <= 1) {
    return { ruleId: 'FR2', risk: ZERO, detail: `${aidSourceCount} aid source(s)` };
  }

  // 2 sources = 0.3, 3 = 0.5, 4+ = 0.7
  const riskMap = { 2: 0.3, 3: 0.5, 4: 0.7 };
  const cappedCount = aidSourceCount > 4 ? 4 : aidSourceCount;
  const risk = toDecimal(riskMap[cappedCount] || 0.7);

  return {
    ruleId: 'FR2',
    risk,
    detail: `${aidSourceCount} overlapping aid sources detected`,
  };
}

module.exports = { evaluateFR2 };
