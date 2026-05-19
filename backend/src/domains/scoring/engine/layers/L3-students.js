const { ZERO, sum, toDecimal } = require('../../../../shared/utils/decimal');
const { WEIGHTS, LAYER_CAPS } = require('../../registry/weights');
const { createLayerResult, triggeredRule } = require('../utils/layer-helpers');

function calculateL3(ctx) {
  const rules = [];
  const contributions = [];

  for (const person of ctx.input.persons) {
    if (!person.isStudent || !person.studentLevel) continue;
    const w = WEIGHTS.STUDENT[person.studentLevel];
    if (!w) continue;
    const weight = toDecimal(w);
    contributions.push(weight);
    rules.push(
      triggeredRule(
        `student_${person.studentLevel.toLowerCase()}`,
        'rules.student_level',
        `Student ${person.name}`,
        `WEIGHTS.STUDENT.${person.studentLevel}`,
        weight,
        weight
      )
    );
  }

  const total = contributions.length ? sum(contributions) : ZERO;
  return createLayerResult('L3', total, LAYER_CAPS.L3_STUDENTS, rules, [], []);
}

module.exports = { calculateL3 };
