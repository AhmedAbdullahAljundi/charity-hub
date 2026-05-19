/**
 * Phase 2 WEIGHTS — Decimal-safe string values.
 * Layer logic must resolve via toDecimal(); never use native float math.
 */

const WEIGHTS = Object.freeze({
  HEAD: {
    AGE_BANDS: [
      { maxAge: 45, weight: '0.6', ruleId: 'head_age_lt45' },
      { maxAge: 55, weight: '0.75', ruleId: 'head_age_45_55' },
      { maxAge: 65, weight: '0.95', ruleId: 'head_age_55_65' },
      { maxAge: Infinity, weight: '1.15', ruleId: 'head_age_gt65' },
    ],
  },
  DEPENDENT_ADULT: {
    AGE_BANDS: [
      { maxAge: 45, weight: '0.6', ruleId: 'dependent_age_lt45' },
      { maxAge: 55, weight: '0.75', ruleId: 'dependent_age_45_55' },
      { maxAge: 65, weight: '0.95', ruleId: 'dependent_age_55_65' },
      { maxAge: Infinity, weight: '1.15', ruleId: 'dependent_age_gt65' },
    ],
    EMPLOYMENT_CORRECTION: {
      SUFFICIENT: '-0.6',
      UNSTABLE: '-0.4',
      WEAK: '-0.2',
    },
  },
  STUDENT: {
    CHILD: '0.5',
    KINDERGARTEN: '0.6',
    PRIMARY: '0.7',
    PREPARATORY: '0.8',
    SECONDARY_GENERAL: '1.0',
    SECONDARY_VOCATIONAL_FEMALE: '0.9',
    SECONDARY_VOCATIONAL_MALE: '0.7',
    UNIVERSITY_SCIENTIFIC: '1.0',
    UNIVERSITY_HUMANITIES: '0.8',
  },
  VULNERABILITY: {
    NO_PROVIDER_BASE: '1.0',
    ORPHAN_PER_CHILD: '1.0',
    PRISON: {
      SHORT: '0.4',
      MEDIUM: '0.7',
      LONG: '1.0',
    },
    ALIMONY: {
      INFORMAL_SUFFICIENT: '-0.8',
      INFORMAL_INSUFFICIENT: '-0.4',
    },
  },
  BURDENS: {
    BRIDE: '0.5',
    BRIDE_SPONSOR: '-0.3',
    SON_IN_PRISON: '0.5',
    DEBT: { A: '0.2', B: '0.4', C: '0.7', D: '1.0' },
    INJURY: { A: '0.2', B: '0.4', C: '0.7', D: '1.0' },
    SURGERY: { A: '0.3', B: '0.5', C: '0.8', D: '1.0', E: '1.5' },
    NO_RATION_CARD: '0.4',
  },
  HOUSING: {
    OWNED: '0.0',
    SHARED: '0.3',
    DONATED_RENT: '0.4',
    RENTED: '0.7',
  },
  DISEASE: {
    TREATMENT: {
      NONE: '0.0',
      PERIODIC_CHEAP: '0.2',
      PERIODIC_EXPENSIVE: '0.4',
      VERY_EXPENSIVE: '0.6',
    },
    FOLLOWUP: {
      NONE_OR_RARE: '0.0',
      REGULAR: '0.3',
      EXPENSIVE: '0.5',
    },
    WORK_IMPACT: {
      NONE: '0.0',
      MINOR: '0.2',
      MAJOR_WORKS: '0.4',
      CANNOT_WORK: '0.6',
    },
  },
  DISABILITY: {
    WORK_IMPACT: {
      NONE: '0.0',
      LIMITED: '0.2',
      SPECIAL_WORK: '0.4',
      CANNOT_WORK: '0.7',
    },
    COMPANION: {
      NONE: '0.0',
      OUTSIDE_ONLY: '0.2',
      FULLY_DEPENDENT: '0.4',
    },
    TREATMENT: {
      NONE: '0.0',
      PERIODIC_CHEAP: '0.2',
      PERIODIC_EXPENSIVE: '0.4',
      VERY_EXPENSIVE: '0.6',
    },
  },
  CORRECTIONS: {
    HEAD: {
      WEAK: '-0.5',
      SEASONAL: '-1.0',
      REGULAR: '-1.5',
      ABROAD_WEAK: '-2.5',
      ABROAD_MEDIUM: '-3.0',
      ABROAD_REGULAR: '-3.5',
    },
    SON_SINGLE_SAME_HOUSE: {
      SEASONAL: '-0.5',
      REGULAR: '-1.0',
      ABROAD: '-2.0',
    },
    SON_MARRIED_SAME_HOUSE: {
      SEASONAL: '-0.4',
      REGULAR: '-0.7',
      ABROAD: '-1.5',
    },
    SON_MARRIED_OUTSIDE_HOUSE: {
      SEASONAL: '-0.2',
      REGULAR: '-0.5',
      ABROAD: '-1.0',
    },
    FAMILY_UNKNOWN_SUPPORT: '-0.5',
    FOOD_ASSISTANCE: '-0.5',
    BANK_ASSETS: {
      A: '-0.3',
      B: '-0.8',
      C: '-1.2',
      D: '-1.6',
      E: '-2.0',
      F: '-4.0',
    },
  },
  EDUCATION_MULTIPLIER: {
    ILLITERATE: '1.0',
    MEDIUM: '1.3',
    HIGHER_LIMITED: '1.6',
    HIGHER_STABLE: '2.0',
  },
  INCOME: {
    DIVISOR: -1500,
    PENALTY_LOW_VERIFY: '-2.0',
    TOTAL_CHANNELS: 8,
  },
});

const LAYER_CAPS = Object.freeze({
  L1_HEAD: '2.0',
  L2_DEPENDENTS: '6.0',
  L3_STUDENTS: '5.0',
  L4_VULNERABILITY: '5.0',
  L5_BURDENS: '4.0',
  L5B_HOUSING: '0.7',
  L6_HEALTH: '4.0',
  L7_CORRECTIONS: '-10.0',
  L8_INCOME: '3.0',
  THEORETICAL_MAX: '25.0',
});

module.exports = { WEIGHTS, LAYER_CAPS };
