/**
 * Layer 1: Family Composition
 *
 * Measures vulnerability from household structure:
 * - Family size with diminishing returns
 * - Age-based dependency (children under 6/18, elderly 60+)
 * - Single-parent bonus
 * - Orphan household bonus
 * - Dependency ratio
 *
 * Cap: LAYER_CAPS.L1_FAMILY_COMPOSITION
 */

const { ZERO, toDecimal, add, mul, div, sum } = require('../../../../shared/utils/decimal');
const { L1, LAYER_CAPS } = require('../../../../shared/constants/weights');
const { createLayerResult, triggeredRule, skippedRule } = require('../layer-result');

/**
 * @param {Object} dto — household DTO
 * @returns {LayerResult}
 */
function calculateL1(dto) {
  const rules = [];
  const skipped = [];
  const warnings = [];

  const members = dto.members || [];
  const memberCount = members.length;

  if (memberCount === 0) {
    warnings.push('No members found in household');
    return createLayerResult('L1', ZERO, LAYER_CAPS.L1_FAMILY_COMPOSITION, rules, skipped, warnings);
  }

  let total = ZERO;

  // ── Family size with diminishing returns ──
  let sizeScore = ZERO;
  for (let i = 0; i < memberCount; i++) {
    if (i < L1.DIMINISHING_AFTER) {
      sizeScore = add(sizeScore, L1.BASE_PER_MEMBER);
    } else {
      sizeScore = add(sizeScore, mul(L1.BASE_PER_MEMBER, L1.DIMINISHING_FACTOR));
    }
  }
  rules.push(triggeredRule('L1_SIZE', 'family_size', `Household size: ${memberCount} members`, 'L1.BASE_PER_MEMBER', sizeScore, sizeScore));
  total = add(total, sizeScore);

  // ── Age-based scoring ──
  const now = new Date();
  let childrenUnder6 = 0;
  let children6to18 = 0;
  let elderly = 0;
  let workingAge = 0;

  for (const m of members) {
    const age = m.age != null ? m.age : (m.birthDate ? Math.floor((now - new Date(m.birthDate)) / 31557600000) : null);
    if (age == null) continue;

    if (age < 6) childrenUnder6++;
    else if (age < 18) children6to18++;
    else if (age >= 60) elderly++;
    else workingAge++;
  }

  if (childrenUnder6 > 0) {
    const pts = mul(L1.CHILD_UNDER_6, childrenUnder6);
    rules.push(triggeredRule('L1_CHILD_U6', 'children_under_6', `Dependent children under 6: ${childrenUnder6}`, 'L1.CHILD_UNDER_6', pts, pts));
    total = add(total, pts);
  }
  if (children6to18 > 0) {
    const pts = mul(L1.CHILD_6_TO_18, children6to18);
    rules.push(triggeredRule('L1_CHILD_6_18', 'children_6_to_18', `Dependent children 6-18: ${children6to18}`, 'L1.CHILD_6_TO_18', pts, pts));
    total = add(total, pts);
  }
  if (elderly > 0) {
    const pts = mul(L1.ELDERLY_OVER_60, elderly);
    rules.push(triggeredRule('L1_ELDERLY', 'elderly_members', `Elderly dependents > 60: ${elderly}`, 'L1.ELDERLY_OVER_60', pts, pts));
    total = add(total, pts);
  }

  // ── Single parent bonus ──
  const hasHusband = members.some(m => m.role === 'HUSBAND');
  const hasWife = members.some(m => m.role === 'WIFE');
  const hasChildren = (childrenUnder6 + children6to18) > 0;

  if (hasChildren && ((hasHusband && !hasWife) || (!hasHusband && hasWife))) {
    rules.push(triggeredRule('L1_SINGLE_PARENT', 'single_parent', 'Single parent household', 'L1.SINGLE_PARENT_BONUS', L1.SINGLE_PARENT_BONUS, L1.SINGLE_PARENT_BONUS));
    total = add(total, L1.SINGLE_PARENT_BONUS);
  }

  // ── Orphan household bonus ──
  if (dto.socialStatus === 'ORPHANS') {
    rules.push(triggeredRule('L1_ORPHAN', 'orphan_household', 'Household classified as orphans', 'L1.ORPHAN_HOUSEHOLD_BONUS', L1.ORPHAN_HOUSEHOLD_BONUS, L1.ORPHAN_HOUSEHOLD_BONUS));
    total = add(total, L1.ORPHAN_HOUSEHOLD_BONUS);
  }

  // ── Dependency ratio ──
  const dependents = childrenUnder6 + children6to18 + elderly;
  if (workingAge > 0 && dependents > 0) {
    const ratio = div(dependents, workingAge);
    if (ratio.greaterThan(1)) {
      const pts = mul(L1.DEPENDENCY_RATIO_MULTIPLIER, ratio);
      rules.push(triggeredRule('L1_DEP_RATIO', 'dependency_ratio', `High dependency ratio: ${ratio.toFixed(2)}`, 'L1.DEPENDENCY_RATIO_MULTIPLIER', pts, pts));
      total = add(total, pts);
    }
  } else if (workingAge === 0 && dependents > 0) {
    // No working-age adults — critical
    const pts = mul(L1.DEPENDENCY_RATIO_MULTIPLIER, 3);
    rules.push(triggeredRule('L1_DEP_RATIO', 'dependency_ratio_critical', 'Critical dependency: no working-age adults', 'L1.DEPENDENCY_RATIO_MULTIPLIER', pts, pts));
    total = add(total, pts);
  }

  return createLayerResult('L1', total, LAYER_CAPS.L1_FAMILY_COMPOSITION, rules, skipped, warnings);
}

module.exports = { calculateL1 };
