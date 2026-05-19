const { normalize } = require('../engine/normalizer');
const { EligibilityLevel } = require('../../../shared/constants/enums');

describe('Score normalizer (Phase 2)', () => {
  test('clamps normalized percent at 0', () => {
    const res = normalize(-10);
    expect(res.normalizedPercent.toNumber()).toBe(0);
    expect(res.eligibilityLevel).toBe(EligibilityLevel.NOT_ELIGIBLE);
  });

  test('maps raw score to percent using THEORETICAL_MAX 25', () => {
    const res = normalize(12.5);
    expect(res.normalizedPercent.toNumber()).toBe(50);
  });

  test('assigns eligibility tiers at 80/60/40/20 thresholds', () => {
    expect(normalize(20).eligibilityLevel).toBe(EligibilityLevel.CRITICAL);
    expect(normalize(15).eligibilityLevel).toBe(EligibilityLevel.HIGH_NEED);
    expect(normalize(10).eligibilityLevel).toBe(EligibilityLevel.MODERATE_NEED);
    expect(normalize(5).eligibilityLevel).toBe(EligibilityLevel.LOW_NEED);
    expect(normalize(4).eligibilityLevel).toBe(EligibilityLevel.NOT_ELIGIBLE);
  });
});
