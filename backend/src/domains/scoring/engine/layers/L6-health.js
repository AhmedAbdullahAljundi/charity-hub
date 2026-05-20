const { ZERO, sum, toDecimal, add, mul } = require('../../../../shared/utils/decimal');
const { WEIGHTS, LAYER_CAPS } = require('../../registry/weights');
const { createLayerResult, triggeredRule } = require('../utils/layer-helpers');

function calculateL6(ctx) {
  const rules = [];
  const contributions = [];
  let healthConditionIndex = 0;

  for (const person of ctx.input.persons) {
    for (const disease of person.diseases) {
      const multiplier = healthConditionIndex >= 2 ? toDecimal('0.5') : toDecimal('1.0');
      const part = add(
        add(
          WEIGHTS.DISEASE.TREATMENT[disease.treatmentCost] ?? '0',
          WEIGHTS.DISEASE.FOLLOWUP[disease.followup] ?? '0'
        ),
        WEIGHTS.DISEASE.WORK_IMPACT[disease.workImpact] ?? '0'
      );
      const contrib = mul(part, multiplier);
      contributions.push(contrib);
      rules.push(
        triggeredRule(
          `disease_${person.id}_${disease.name}`,
          'rules.disease',
          disease.name,
          'WEIGHTS.DISEASE',
          contrib,
          contrib
        )
      );
      healthConditionIndex++;
    }

    for (const disability of person.disabilities) {
      const multiplier = healthConditionIndex >= 2 ? toDecimal('0.5') : toDecimal('1.0');
      const part = add(
        add(
          WEIGHTS.DISABILITY.WORK_IMPACT[disability.workImpact] ?? '0',
          WEIGHTS.DISABILITY.COMPANION[disability.companion] ?? '0'
        ),
        WEIGHTS.DISABILITY.TREATMENT[disability.treatmentCost] ?? '0'
      );
      const contrib = mul(part, multiplier);
      contributions.push(contrib);
      rules.push(
        triggeredRule(
          `disability_${person.id}`,
          'rules.disability',
          disability.description,
          'WEIGHTS.DISABILITY',
          contrib,
          contrib
        )
      );
      healthConditionIndex++;
    }
  }

  const total = contributions.length ? sum(contributions) : ZERO;
  return createLayerResult('L6', total, LAYER_CAPS.L6_HEALTH, rules, [], []);
}

module.exports = { calculateL6 };
