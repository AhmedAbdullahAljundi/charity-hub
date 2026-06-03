const { toDecimal } = require('../../../shared/utils/decimal');

function explain(aggregated, ctx) {
  const allRules = ctx.layerResults.flatMap((l) =>
    l.triggeredRules.map((r) => ({
      ...r,
      layerId: l.layerId,
      value: toDecimal(r.cappedContribution ?? r.rawContribution ?? 0),
    }))
  );

  const topPositiveFactors = allRules
    .filter((r) => r.value.greaterThan(0))
    .sort((a, b) => b.value.minus(a.value).toNumber())
    .slice(0, 10)
    .map((r) => ({
      factorKey: r.ruleId,
      weight: r.value.toFixed(4),
      layerId: r.layerId,
      label: r.humanReadableExplanation,
    }));

  const topNegativeFactors = allRules
    .filter((r) => r.value.lessThan(0))
    .sort((a, b) => a.value.minus(b.value).toNumber())
    .slice(0, 10)
    .map((r) => ({
      factorKey: r.ruleId,
      weight: r.value.toFixed(4),
      layerId: r.layerId,
      label: r.humanReadableExplanation,
    }));

  const layerWarnings = ctx.layerResults.flatMap((l) => l.warnings);
  const warnings = [...layerWarnings, ...(ctx.l8Warnings || [])];

  return {
    topPositiveFactors,
    topNegativeFactors,
    warnings,
    recommendations: [],
  };
}

module.exports = { explain };
