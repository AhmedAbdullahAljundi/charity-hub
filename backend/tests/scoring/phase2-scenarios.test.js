/**
 * Phase 2 scoring — locked regression scenarios (T01–T08).
 * Percentages computed from WEIGHTS + LAYER_CAPS.THEORETICAL_MAX (25).
 */

const { runScoringEngine } = require('../../src/domains/scoring/engine/engine');
const { EligibilityLevel } = require('../../src/shared/constants/enums');
const fixtures = require('./fixtures/phase2-inputs');

const SCENARIOS = [
  {
    id: 'T01',
    input: fixtures.T01_WIDOW_RENTED,
    specLabel: 'Widow + 3 children + rented + unverified',
    expectedRecommendation: EligibilityLevel.LOW_NEED,
    expectedPercent: 22.0,
    mustTrigger: ['vuln_no_provider', 'orphan_per_child', 'housing_rented', 'income_low_verify'],
    mustWarn: ['LOW_VERIFICATION_PENALTY'],
  },
  {
    id: 'T02',
    input: fixtures.T02_DIVORCED_ALIMONY,
    specLabel: 'Divorced + informal alimony + rented',
    expectedRecommendation: EligibilityLevel.LOW_NEED,
    expectedPercent: 36.4,
    mustTrigger: ['vuln_no_provider', 'housing_rented', 'burden_debt_D'],
    mustWarn: ['LOW_VERIFICATION_PENALTY'],
  },
  {
    id: 'T03',
    input: fixtures.T03_PRISON_FAMILY,
    specLabel: 'Prisoner long + wife seasonal',
    expectedRecommendation: EligibilityLevel.LOW_NEED,
    expectedPercent: 20.4,
    mustTrigger: ['prison_term_long', 'burden_son_in_prison', 'housing_rented'],
    mustWarn: ['LOW_VERIFICATION_PENALTY'],
  },
  {
    id: 'T04',
    input: fixtures.T04_SICK_DISABLED,
    specLabel: 'Disabled father + expensive treatment',
    expectedRecommendation: EligibilityLevel.MODERATE_NEED,
    expectedPercent: 46.2,
    mustTrigger: ['disease_', 'disability_', 'housing_donated_rent'],
    mustWarn: ['LOW_VERIFICATION_PENALTY'],
  },
  {
    id: 'T05',
    input: fixtures.T05_ELDERLY_PENSION,
    specLabel: 'Elderly + burdens + unverified income',
    expectedRecommendation: EligibilityLevel.LOW_NEED,
    expectedPercent: 21.0,
    mustTrigger: ['head_age_gt65', 'housing_owned', 'burden_debt_D', 'income_low_verify'],
    mustWarn: ['LOW_VERIFICATION_PENALTY'],
  },
  {
    id: 'T06',
    input: fixtures.T06_ABROAD_SON,
    specLabel: 'Large family + son contributor seasonal',
    expectedRecommendation: EligibilityLevel.NOT_ELIGIBLE,
    expectedPercent: 7.6,
    mustTrigger: ['correction_son_contributor', 'student_primary'],
    mustWarn: ['LOW_VERIFICATION_PENALTY'],
  },
  {
    id: 'T07',
    input: fixtures.T07_BRIDE_DEBT,
    specLabel: 'Bride + debt D + surgery E',
    expectedRecommendation: EligibilityLevel.LOW_NEED,
    expectedPercent: 26.6,
    mustTrigger: ['burden_bride', 'burden_debt_D', 'burden_surgery_E', 'housing_rented'],
    mustWarn: ['LOW_VERIFICATION_PENALTY'],
  },
  {
    id: 'T08',
    input: fixtures.T08_HIGH_INCOME,
    specLabel: 'High income fully verified',
    expectedRecommendation: EligibilityLevel.NOT_ELIGIBLE,
    expectedPercent: 0.0,
    mustTrigger: ['correction_head_employment', 'correction_bank_assets'],
    mustWarn: [],
  },
];

function ruleIds(output) {
  return output.layerBreakdown.flatMap((l) => l.triggeredRules.map((r) => r.ruleId));
}

function pct(output) {
  return parseFloat(output.normalizedPercent.toString());
}

describe.each(SCENARIOS)('Phase 2 $id — $specLabel', (scenario) => {
  let output;

  beforeAll(() => {
    output = runScoringEngine(scenario.input);
  });

  it('matches systemRecommendation', () => {
    expect(output.systemRecommendation).toBe(scenario.expectedRecommendation);
  });

  it('matches normalizedPercent (±0.5)', () => {
    expect(pct(output)).toBeGreaterThanOrEqual(scenario.expectedPercent - 0.5);
    expect(pct(output)).toBeLessThanOrEqual(scenario.expectedPercent + 0.5);
  });

  it('triggers expected rule IDs', () => {
    const ids = ruleIds(output);
    for (const prefix of scenario.mustTrigger) {
      const found = ids.some((id) => id === prefix || id.startsWith(prefix));
      expect(found).toBe(true);
    }
  });

  it('includes expected warnings', () => {
    for (const w of scenario.mustWarn) {
      expect(output.warnings).toContain(w);
    }
    for (const w of scenario.mustNotWarn || []) {
      expect(output.warnings).not.toContain(w);
    }
  });

  it('never uses fraud/confidence to override recommendation tier alone', () => {
    expect(output).toHaveProperty('fraudRiskScore');
    expect(output).toHaveProperty('confidenceScore');
    expect(output.systemRecommendation).toBe(scenario.expectedRecommendation);
  });
});
