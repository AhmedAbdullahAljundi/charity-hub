const { runScoringEngine } = require('../engine/engine');
const { T01_WIDOW_RENTED } = require('../../../../tests/scoring/fixtures/phase2-inputs');

describe('Scoring Engine Orchestrator (Phase 2)', () => {
  it('produces the FinalOutput contract', () => {
    const output = runScoringEngine(T01_WIDOW_RENTED);

    expect(output).toHaveProperty('vulnerabilityScore');
    expect(output).toHaveProperty('reductionScore');
    expect(output).toHaveProperty('confidenceScore');
    expect(output).toHaveProperty('fraudRiskScore');
    expect(output).toHaveProperty('finalScore');
    expect(output).toHaveProperty('normalizedPercent');
    expect(output).toHaveProperty('systemRecommendation');
    expect(output).toHaveProperty('layerBreakdown');

    const output2 = runScoringEngine(T01_WIDOW_RENTED);
    expect(output.finalScore.toString()).toBe(output2.finalScore.toString());
  });

  it('is deterministic for the same normalized input', () => {
    const a = runScoringEngine(T01_WIDOW_RENTED);
    const b = runScoringEngine(T01_WIDOW_RENTED);
    expect(a.systemRecommendation).toBe(b.systemRecommendation);
    expect(a.normalizedPercent.toString()).toBe(b.normalizedPercent.toString());
  });
});
