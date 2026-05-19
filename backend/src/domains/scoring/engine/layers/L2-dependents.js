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
    if (person.role !== 'DEPENDENT_ADULT') continue;
    if (!isResident(person)) continue;
    if (person.markedAsL4Processed) continue;

    const { total: contrib, rules: personRules } = dependentAdultContribution(
      person,
      null,
      'dependent'
    );
    total = sum([total, contrib]);
    rules.push(...personRules);
  }

  return createLayerResult('L2', total, LAYER_CAPS.L2_DEPENDENTS, rules, [], []);
}

module.exports = { calculateL2 };
