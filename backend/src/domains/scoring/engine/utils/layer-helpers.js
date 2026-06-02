const { createLayerResult, triggeredRule, skippedRule } = require('../../../../modules/scoring/engine/layer-result');
const { toDecimal, add, mul } = require('../../../../shared/utils/decimal');
const { WEIGHTS } = require('../../registry/weights');
const { ageBand } = require('./age-band');

function isResident(person) {
  return person.residencyStatus === 'RESIDENT';
}

function findHead(input) {
  return input.persons.find((p) => p.isHead) ?? input.persons.find((p) => p.role === 'HEAD');
}

function findSpouse(input) {
  return input.persons.find((p) => p.role === 'SPOUSE');
}

function educationMultiplier(person) {
  return toDecimal(WEIGHTS.EDUCATION_MULTIPLIER[person.educationLevel] ?? '1.0');
}

/**
 * Spouse / dependent adult base + employment correction (L2 / L4 pattern).
 */
function dependentAdultContribution(person, weights, prefix = 'dependent', skipAgeWeight = false) {
  const { weight, ruleId } = ageBand(person.age, WEIGHTS.DEPENDENT_ADULT.AGE_BANDS);
  const rules = [];
  let total = ZERO;
  
  if (!skipAgeWeight) {
    total = weight;
    rules.push(
      triggeredRule(
        ruleId ?? `${prefix}_age`,
        `${prefix}_age_band`,
        `Age ${person.age} band`,
        `WEIGHTS.DEPENDENT_ADULT.AGE_BANDS`,
        weight,
        weight
      )
    );
  } else {
    rules.push(
      skippedRule(
        `${prefix}_age_band`,
        `Age ${person.age} band`,
        'Skipped due to WIDOWED_MARRIED status'
      )
    );
  }

  if (person.employmentQuality) {
    const corrRaw = WEIGHTS.DEPENDENT_ADULT.EMPLOYMENT_CORRECTION[person.employmentQuality];
    if (corrRaw) {
      const corr = mul(corrRaw, person.educationMultiplier);
      total = add(total, corr);
      rules.push(
        triggeredRule(
          `${prefix}_employment_${person.employmentQuality.toLowerCase()}`,
          `${prefix}_employment`,
          `Employment quality ${person.employmentQuality}`,
          'WEIGHTS.DEPENDENT_ADULT.EMPLOYMENT_CORRECTION',
          corr,
          corr
        )
      );
    }
  }

  return { total, rules };
}

module.exports = {
  isResident,
  findHead,
  findSpouse,
  educationMultiplier,
  dependentAdultContribution,
  createLayerResult,
  triggeredRule,
  skippedRule,
  toDecimal,
  add,
  mul,
};
