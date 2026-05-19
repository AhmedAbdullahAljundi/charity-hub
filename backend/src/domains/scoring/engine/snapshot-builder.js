function buildSnapshot(ctx, explained, engineVersion, ruleVersion) {
  return {
    engineVersion: engineVersion || process.env.SCORING_ENGINE_VERSION || '2.0.0',
    ruleVersion: ruleVersion || process.env.SCORING_RULE_VERSION || '2024-01',
    calculatedAt: new Date().toISOString(),
    inputHash: null,
    weightsSnapshot: ctx.weights?.snapshot ?? {},
    householdId: ctx.input.householdId,
    personCount: ctx.input.persons.length,
    triggeredRuleCount: ctx.layerResults.reduce(
      (n, l) => n + l.triggeredRules.length,
      0
    ),
  };
}

module.exports = { buildSnapshot };
