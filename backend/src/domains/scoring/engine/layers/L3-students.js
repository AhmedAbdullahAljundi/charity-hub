const { ZERO, sum, toDecimal } = require('../../../../shared/utils/decimal');
const { WEIGHTS, LAYER_CAPS } = require('../../registry/weights');
const { createLayerResult, triggeredRule } = require('../utils/layer-helpers');

function calculateL3(ctx) {
  const rules = [];
  const contributions = [];

  for (const person of ctx.input.persons) {
    if (!person.isStudent || !person.studentLevel) continue;
    
    let weight = ZERO;
    let weightSrc = '';
    
    if (person.isSpecialEducation) {
      weightSrc = 'SPECIAL_EDUCATION (0)';
      // Weight is already ZERO
    } else {
      const w = WEIGHTS.STUDENT[person.studentLevel];
      if (!w) continue;
      weight = toDecimal(w);
      weightSrc = `WEIGHTS.STUDENT.${person.studentLevel}`;
    }

    contributions.push(weight);
    rules.push(
      triggeredRule(
        `student_${person.studentLevel.toLowerCase()}`,
        'rules.student_level',
        `Student ${person.name}`,
        weightSrc,
        weight,
        weight
      )
    );
  }

  const total = contributions.length ? sum(contributions) : ZERO;
  return createLayerResult('L3', total, LAYER_CAPS.L3_STUDENTS, rules, [], []);
}

module.exports = { calculateL3 };
