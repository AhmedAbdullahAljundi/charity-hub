const { calculateL8 } = require('../layers/L8-income');

function runConfidenceEngine(ctx) {
  const l8 = calculateL8(ctx);
  ctx.layerResults.push(l8);
  return {
    incomeAdjustment: ctx.incomeAdjustment,
    confidenceScore: ctx.confidenceScore,
    layer: l8,
  };
}

module.exports = { runConfidenceEngine };
