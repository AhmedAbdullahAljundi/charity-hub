const { toDecimal } = require('../../../../shared/utils/decimal');
const { WEIGHTS, LAYER_CAPS } = require('../../registry/weights');
const { createLayerResult, triggeredRule } = require('../utils/layer-helpers');

function calculateL5b(ctx) {
  const housingType = ctx.input.housingType;
  const raw = WEIGHTS.HOUSING[housingType] ?? '0';
  const score = toDecimal(raw);
  const rules = [
    triggeredRule(
      `housing_${housingType.toLowerCase()}`,
      'rules.housing',
      `Housing ${housingType}`,
      `WEIGHTS.HOUSING.${housingType}`,
      score,
      score
    ),
  ];
  return createLayerResult('L5b', score, LAYER_CAPS.L5B_HOUSING, rules, [], []);
}

module.exports = { calculateL5b };
