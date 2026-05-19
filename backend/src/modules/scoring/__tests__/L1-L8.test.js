const { calculateL1 } = require('../engine/layers/L1-family-composition');
const { calculateL2 } = require('../engine/layers/L2-income-assessment');
const { calculateL8 } = require('../engine/layers/L8-confidence');
const { L1, L2, L8, LAYER_CAPS } = require('../../../shared/constants/weights');
const { largeFamilyDto, emptyDto, standardFamilyDto } = require('../fixtures/dtos');

describe.skip('Legacy Layer 1–8 (pre–Phase 2)', () => {
describe('Layer 1: Family Composition', () => {
  it('enforces diminishing returns on large families', () => {
    const res = calculateL1(largeFamilyDto);
    expect(res.layerId).toBe('L1');
    expect(res.score.toNumber()).toBeGreaterThan(0);
    expect(res.cappedScore.toNumber()).toBeLessThanOrEqual(LAYER_CAPS.L1_FAMILY_COMPOSITION.toNumber());
    
    // Size rule specifically
    const sizeRule = res.triggeredRules.find(r => r.ruleId === 'L1_SIZE');
    expect(sizeRule).toBeDefined();
    // 5 base * 2 + 10 * (2 * 0.5) = 10 + 10 = 20
    expect(sizeRule.rawContribution.toNumber()).toBe(20);
  });

  it('handles empty dto safely', () => {
    const res = calculateL1(emptyDto);
    expect(res.score.toNumber()).toBe(0);
    expect(res.warnings.length).toBeGreaterThan(0);
  });
});

describe('Layer 2: Income Assessment', () => {
  it('calculates adjusted denominator and prevents double counting', () => {
    // Family of 2, 1 adult, 1 severe disabled child
    const dto = {
      members: [
        { id: '1', role: 'HUSBAND', birthDate: '1980-01-01' },
        { id: '2', role: 'CHILD', birthDate: '2020-01-01', disability: 'D' } // severe -> 0.25
      ],
      incomes: [{ amount: '2000' }]
    };
    const res = calculateL2(dto);
    
    // Denominator = 1.0 (adult) + 0.25 (severe child) = 1.25
    // Income = 2000. Per capita = 2000 / 1.25 = 1600.
    // 1600 is <= 2000 (LOW_INCOME_LINE) so it triggers L2_LOW_INCOME
    const incRule = res.triggeredRules.find(r => r.ruleId === 'L2_LOW_INCOME');
    expect(incRule).toBeDefined();
    expect(incRule.humanReadableExplanation).toContain('adjusted size: 1.25');
  });

  it('never drops denominator below 1.0', () => {
    const dto = {
      members: [
        { id: '1', birthDate: '2020-01-01', disability: 'D' } // Only member is severe -> 0.25 weight
      ],
      incomes: [{ amount: '1000' }]
    };
    const res = calculateL2(dto);
    const incRule = res.triggeredRules.find(r => r.ruleId === 'L2_POVERTY' || r.ruleId === 'L2_LOW_INCOME' || r.ruleId === 'L2_MEDIUM_INCOME');
    expect(incRule.humanReadableExplanation).toContain('adjusted size: 1.00'); // clamped to 1.0
  });

  it('handles zero income edge case safely', () => {
    const res = calculateL2(emptyDto);
    expect(res.score.toNumber()).toBeGreaterThan(0);
    const noInc = res.triggeredRules.find(r => r.ruleId === 'L2_NO_INCOME');
    expect(noInc.rawContribution.toNumber()).toBe(L2.SCORE_BELOW_POVERTY.toNumber());
  });
});

describe('Layer 8: Confidence', () => {
  it('caps confidence at 1.0 and does not return negative', () => {
    const res = calculateL8(standardFamilyDto);
    expect(res.score.toNumber()).toBeLessThanOrEqual(1.0);
    expect(res.score.toNumber()).toBeGreaterThanOrEqual(0);
  });
  
  it('flags low confidence if data is entirely missing', () => {
    const res = calculateL8(emptyDto);
    expect(res.score.toNumber()).toBeLessThan(L8.LOW_CONFIDENCE_THRESHOLD.toNumber());
    expect(res.warnings.some(w => w.includes('LOW_CONFIDENCE'))).toBe(true);
  });
});
});
