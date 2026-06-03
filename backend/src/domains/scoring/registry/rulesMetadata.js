/**
 * Rule metadata registry — audit + explainability + override resolution.
 */

const { WEIGHTS } = require('./weights');

/** @typedef {{ id: string, layer: string, subEngine: string, category: string, labelKey: string, configurable: boolean, defaultValue: string, maxContribution: string, dependsOn: string[] }} RuleMetadata */

/** @param {Partial<RuleMetadata> & Pick<RuleMetadata, 'id' | 'layer' | 'defaultValue'>} entry */
function rule(entry) {
  return {
    subEngine: 'vulnerability',
    category: 'general',
    labelKey: `rules.${entry.id}`,
    configurable: true,
    maxContribution: entry.defaultValue,
    dependsOn: [],
    ...entry,
  };
}

const STATIC_RULES = [
  ...WEIGHTS.HEAD.AGE_BANDS.map((b) =>
    rule({
      id: b.ruleId,
      layer: 'L1',
      category: 'head_age',
      defaultValue: b.weight,
      maxContribution: b.weight,
    })
  ),
  rule({ id: 'head_absent_other_skip', layer: 'L1', subEngine: 'vulnerability', category: 'head', defaultValue: '0', configurable: false, dependsOn: [] }),
  ...WEIGHTS.DEPENDENT_ADULT.AGE_BANDS.map((b) =>
    rule({
      id: b.ruleId,
      layer: 'L2',
      category: 'dependent_age',
      defaultValue: b.weight,
      maxContribution: b.weight,
    })
  ),
  rule({ id: 'dependent_employment_correction', layer: 'L2', category: 'employment', defaultValue: '-0.6', maxContribution: '0' }),
  ...Object.entries(WEIGHTS.STUDENT).map(([level, w]) =>
    rule({ id: `student_${level.toLowerCase()}`, layer: 'L3', category: 'student', defaultValue: w, maxContribution: w })
  ),
  rule({ id: 'vuln_no_provider', layer: 'L4', category: 'absence', defaultValue: WEIGHTS.VULNERABILITY.NO_PROVIDER_BASE, dependsOn: ['head_is_absent'] }),
  rule({ id: 'widow_age_lt45', layer: 'L4', category: 'widow', defaultValue: '0.6', dependsOn: ['absent_head_death'] }),
  rule({ id: 'widow_age_45_55', layer: 'L4', category: 'widow', defaultValue: '0.75', dependsOn: ['absent_head_death'] }),
  rule({ id: 'widow_age_55_65', layer: 'L4', category: 'widow', defaultValue: '0.95', dependsOn: ['absent_head_death'] }),
  rule({ id: 'widow_age_gt65', layer: 'L4', category: 'widow', defaultValue: '1.15', dependsOn: ['absent_head_death'] }),
  rule({ id: 'divorce_spouse_base', layer: 'L4', category: 'motion', defaultValue: '0.6', dependsOn: ['absent_head_divorce'] }),
  rule({ id: 'divorce_alimony_correction', layer: 'L4', category: 'alimony', defaultValue: '-0.8', dependsOn: ['absent_head_divorce'] }),
  rule({ id: 'prison_term_short', layer: 'L4', category: 'prison', defaultValue: WEIGHTS.VULNERABILITY.PRISON.SHORT, dependsOn: ['absent_head_prison'] }),
  rule({ id: 'prison_term_medium', layer: 'L4', category: 'prison', defaultValue: WEIGHTS.VULNERABILITY.PRISON.MEDIUM, dependsOn: ['absent_head_prison'] }),
  rule({ id: 'prison_term_long', layer: 'L4', category: 'prison', defaultValue: WEIGHTS.VULNERABILITY.PRISON.LONG, dependsOn: ['absent_head_prison'] }),
  rule({ id: 'prison_suspicion_none', layer: 'L4', category: 'prison', defaultValue: '0.0', dependsOn: ['absent_head_prison'] }),
  rule({ id: 'prison_suspicion_low', layer: 'L4', category: 'prison', defaultValue: WEIGHTS.VULNERABILITY.PRISON_SUSPICION.LOW, dependsOn: ['absent_head_prison'] }),
  rule({ id: 'prison_suspicion_mid', layer: 'L4', category: 'prison', defaultValue: WEIGHTS.VULNERABILITY.PRISON_SUSPICION.MID, dependsOn: ['absent_head_prison'] }),
  rule({ id: 'prison_suspicion_high', layer: 'L4', category: 'prison', defaultValue: WEIGHTS.VULNERABILITY.PRISON_SUSPICION.HIGH, dependsOn: ['absent_head_prison'] }),
  rule({ id: 'prison_suspicion_max', layer: 'L4', category: 'prison', defaultValue: WEIGHTS.VULNERABILITY.PRISON_SUSPICION.MAX, dependsOn: ['absent_head_prison'] }),
  rule({ id: 'orphan_per_child', layer: 'L4', category: 'orphan', defaultValue: WEIGHTS.VULNERABILITY.ORPHAN_PER_CHILD, dependsOn: ['absent_head_death'] }),
  rule({ id: 'burden_bride', layer: 'L5', category: 'burden', defaultValue: WEIGHTS.BURDENS.BRIDE }),
  rule({ id: 'burden_bride_sponsor', layer: 'L5', category: 'burden', defaultValue: WEIGHTS.BURDENS.BRIDE_SPONSOR }),
  rule({ id: 'burden_son_in_prison', layer: 'L5', category: 'burden', defaultValue: WEIGHTS.BURDENS.SON_IN_PRISON }),
  rule({ id: 'burden_no_ration_card', layer: 'L5', category: 'burden', defaultValue: WEIGHTS.BURDENS.NO_RATION_CARD }),
  rule({ id: 'housing_owned', layer: 'L5b', category: 'housing', defaultValue: WEIGHTS.HOUSING.OWNED }),
  rule({ id: 'housing_rented', layer: 'L5b', category: 'housing', defaultValue: WEIGHTS.HOUSING.RENTED }),
  rule({ id: 'disease_treatment', layer: 'L6', category: 'health', defaultValue: '0.6' }),
  rule({ id: 'disability_work_impact', layer: 'L6', category: 'health', defaultValue: '0.7' }),
  rule({ id: 'correction_head_employment', layer: 'L7', subEngine: 'reduction', category: 'employment', defaultValue: '-1.5' }),
  rule({ id: 'correction_son_contributor', layer: 'L7', subEngine: 'reduction', category: 'son', defaultValue: '-1.0' }),
  rule({ id: 'correction_family_support', layer: 'L7', subEngine: 'reduction', category: 'household', defaultValue: WEIGHTS.CORRECTIONS.FAMILY_UNKNOWN_SUPPORT }),
  rule({ id: 'correction_food_aid', layer: 'L7', subEngine: 'reduction', category: 'household', defaultValue: WEIGHTS.CORRECTIONS.FOOD_ASSISTANCE }),
  rule({ id: 'correction_bank_assets', layer: 'L7', subEngine: 'reduction', category: 'assets', defaultValue: '-1.6' }),
  rule({ id: 'income_divisor_score', layer: 'L8', subEngine: 'confidence', category: 'income', defaultValue: '0', configurable: false }),
  rule({ id: 'income_low_verify', layer: 'L8', subEngine: 'confidence', category: 'verification', defaultValue: WEIGHTS.INCOME.PENALTY_LOW_VERIFY, configurable: false }),
  rule({ id: 'fraud_01_high_income_high_score', layer: 'FE', subEngine: 'fraud', category: 'contradiction', defaultValue: '0.2', configurable: false }),
  rule({ id: 'fraud_02_no_ration_assets', layer: 'FE', subEngine: 'fraud', category: 'contradiction', defaultValue: '0.2', configurable: false }),
  rule({ id: 'fraud_03_abroad_son_no_correction', layer: 'FE', subEngine: 'fraud', category: 'contradiction', defaultValue: '0.15', configurable: false }),
  rule({ id: 'fraud_04_high_income_severe_debt', layer: 'FE', subEngine: 'fraud', category: 'contradiction', defaultValue: '0.15', configurable: false }),
];

const RULES_BY_ID = Object.freeze(
  Object.fromEntries(STATIC_RULES.map((r) => [r.id, r]))
);

module.exports = { STATIC_RULES, RULES_BY_ID, rule };
