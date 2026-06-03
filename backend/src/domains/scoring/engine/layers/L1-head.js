const { ZERO } = require('../../../../shared/utils/decimal');
const { WEIGHTS, LAYER_CAPS } = require('../../registry/weights');
const { ageBand } = require('../utils/age-band');
const {
  findHead,
  isResident,
  createLayerResult,
  triggeredRule,
  skippedRule,
  add,
} = require('../utils/layer-helpers');

function calculateL1(ctx) {
  const input = ctx.input;
  const head = findHead(input);
  const skipped = [];
  const rules = [];
  const warnings = [];

  if (!head) {
    warnings.push('NO_HEAD_FOUND');
    return createLayerResult('L1', ZERO, LAYER_CAPS.L1_HEAD, rules, skipped, warnings);
  }

  if (head.residencyStatus === 'ABSENT_OTHER') {
    skipped.push(
      skippedRule('head_absent_other_skip', 'rules.head_absent_other', 'non-causal absence')
    );
    return createLayerResult('L1', ZERO, LAYER_CAPS.L1_HEAD, rules, skipped, warnings);
  }

  if (!isResident(head)) {
    skipped.push(skippedRule('head_non_resident', 'rules.head_non_resident', 'head not resident'));
    return createLayerResult('L1', ZERO, LAYER_CAPS.L1_HEAD, rules, skipped, warnings);
  }

  const { weight, ruleId } = ageBand(head.age, WEIGHTS.HEAD.AGE_BANDS);
  rules.push(
    triggeredRule(
      ruleId ?? 'head_age_band',
      'rules.head_age',
      `Head age ${head.age}`,
      'WEIGHTS.HEAD.AGE_BANDS',
      weight,
      weight
    )
  );

  return createLayerResult('L1', weight, LAYER_CAPS.L1_HEAD, rules, skipped, warnings);
}

module.exports = { calculateL1 };
