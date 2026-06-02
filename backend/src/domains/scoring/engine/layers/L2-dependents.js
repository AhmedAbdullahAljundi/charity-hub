const { ZERO, sum } = require('../../../../shared/utils/decimal');
const { LAYER_CAPS } = require('../../registry/weights');
const {
  isResident,
  dependentAdultContribution,
  createLayerResult,
} = require('../utils/layer-helpers');

function calculateL2(ctx) {
  const rules = [];
  let total = ZERO;

  for (const person of ctx.input.persons) {
    if (!isResident(person)) continue;
    if (person.markedAsL4Processed) continue;

    if (person.role === 'DEPENDENT_ADULT') {
      const { total: contrib, rules: personRules } = dependentAdultContribution(
        person,
        null,
        'dependent'
      );
      total = sum([total, contrib]);
      rules.push(...personRules);
    } else if (person.role === 'CHILD') {
      let childTotal = ZERO;
      
      // 1. Pre-school child weight (under 15, not student)
      if (person.age < 15 && !person.isStudent) {
        const w = toDecimal(require('../../registry/weights').WEIGHTS.STUDENT.PRE_SCHOOL_CHILD);
        childTotal = sum([childTotal, w]);
        rules.push(
          require('../utils/layer-helpers').triggeredRule(
            `child_preschool_${person.id}`,
            'rules.child_preschool',
            `Pre-school child (<15, no edu)`,
            'WEIGHTS.STUDENT.PRE_SCHOOL_CHILD',
            w,
            w
          )
        );
      }
      
      // 2. Age weight for Single Female >= 15 not studying
      if (
        person.gender === 'FEMALE' && 
        person.age >= 15 && 
        (!person.maritalStatus || person.maritalStatus === 'SINGLE') && 
        !person.isStudent
      ) {
        const { weight: ageW, ruleId } = require('../utils/age-band').ageBand(person.age, require('../../registry/weights').WEIGHTS.DEPENDENT_ADULT.AGE_BANDS);
        childTotal = sum([childTotal, ageW]);
        rules.push(
          require('../utils/layer-helpers').triggeredRule(
            ruleId ?? `child_age_${person.id}`,
            'child_age_band',
            `Child age ${person.age} band`,
            `WEIGHTS.DEPENDENT_ADULT.AGE_BANDS`,
            ageW,
            ageW
          )
        );
      }
      
      // 3. Employment Correction (if >= 15 and has employment)
      if (person.age >= 15 && person.employmentQuality && person.employmentQuality !== 'NONE') {
        const corrRaw = require('../../registry/weights').WEIGHTS.DEPENDENT_ADULT.EMPLOYMENT_CORRECTION[person.employmentQuality];
        if (corrRaw) {
          const corr = require('../utils/layer-helpers').mul(corrRaw, person.educationMultiplier);
          childTotal = sum([childTotal, corr]);
          rules.push(
            require('../utils/layer-helpers').triggeredRule(
              `child_employment_${person.employmentQuality.toLowerCase()}_${person.id}`,
              'child_employment',
              `Child employment ${person.employmentQuality}`,
              'WEIGHTS.DEPENDENT_ADULT.EMPLOYMENT_CORRECTION',
              corr,
              corr
            )
          );
        }
      }
      
      total = sum([total, childTotal]);
    }
  }

  return createLayerResult('L2', total, LAYER_CAPS.L2_DEPENDENTS, rules, [], []);
}

module.exports = { calculateL2 };
