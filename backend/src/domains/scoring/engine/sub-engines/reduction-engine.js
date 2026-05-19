const { calculateL7 } = require('../layers/L7-reduction');

function runReductionEngine(ctx) {
  const l7 = calculateL7(ctx);
  ctx.layerResults.push(l7);
  return { reductionScore: l7.cappedScore, layer: l7 };
}

module.exports = { runReductionEngine };
