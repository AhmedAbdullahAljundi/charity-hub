/**
 * Fraud Rule 3: Data Inconsistency
 *
 * Flags contradictions in declared data:
 * - "No income" but has property income
 * - Age/education mismatches (e.g. 5-year-old university graduate)
 * - Deceased members still receiving income
 *
 * Returns a risk score 0–1.
 */

const { ZERO, toDecimal, min, mul } = require('../../../../../shared/utils/decimal');

function evaluateFR3(dto) {
  const members = dto.members || [];
  const incomes = dto.incomes || [];
  let contradictions = 0;
  const details = [];

  // ── Check 1: Property/project income but claimed poor/needy ──
  const hasPropertyIncome = incomes.some(i =>
    i.sourceType === 'PROPERTY' || i.sourceType === 'PROJECT'
  );
  if (hasPropertyIncome && (dto.socialStatus === 'POOR' || dto.socialStatus === 'NEEDY')) {
    contradictions++;
    details.push('property/project income with poor/needy status');
  }

  // ── Check 2: Age-education mismatch ──
  const now = new Date();
  for (const m of members) {
    const age = m.age != null ? m.age : (m.birthDate ? Math.floor((now - new Date(m.birthDate)) / 31557600000) : null);
    if (age == null) continue;

    if (age < 15 && m.educationLevel === 'UNIVERSITY') {
      contradictions++;
      details.push(`${m.name}: age ${age} with university education`);
    }
    if (age < 6 && m.educationLevel && m.educationLevel !== 'NONE' && m.educationLevel !== 'NURSERY') {
      contradictions++;
      details.push(`${m.name}: age ${age} with ${m.educationLevel} education`);
    }
  }

  // ── Check 3: Deceased with active income ──
  const deceasedIds = new Set(members.filter(m => m.deceased).map(m => m.id));
  if (deceasedIds.size > 0) {
    // If any income is attributed to a deceased member's employment
    const headDeceased = members.some(m =>
      (m.role === 'HUSBAND' || m.role === 'WIFE') && m.deceased
    );
    const hasSalary = incomes.some(i => i.sourceType === 'SALARY');
    if (headDeceased && hasSalary) {
      contradictions++;
      details.push('deceased head of household with salary income');
    }
  }

  if (contradictions === 0) {
    return { ruleId: 'FR3', risk: ZERO, detail: 'no inconsistencies found' };
  }

  // Each contradiction adds ~0.25 risk, capped at 0.8
  const risk = min(toDecimal('0.8'), mul(toDecimal(contradictions), toDecimal('0.25')));
  return {
    ruleId: 'FR3',
    risk,
    detail: details.join('; '),
  };
}

module.exports = { evaluateFR3 };
