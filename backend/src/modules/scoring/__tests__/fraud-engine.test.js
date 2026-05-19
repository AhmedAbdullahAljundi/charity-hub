const { evaluateFraud } = require('../engine/fraud/fraud-engine');
const { duplicateAidDto, conflictingDataDto, standardFamilyDto } = require('../fixtures/dtos');
const { FRAUD } = require('../../../shared/constants/weights');

describe.skip('Legacy Fraud Engine (pre–Phase 2)', () => {
describe('Fraud Engine', () => {
  it('detects duplicate aid sources (FR2)', () => {
    const res = evaluateFraud(duplicateAidDto);
    // 4 sources = 0.7 risk
    const rule = res.ruleResults.find(r => r.ruleId === 'FR2');
    expect(rule).toBeDefined();
    expect(rule.risk.toNumber()).toBe(0.7);
    expect(res.fraudRiskScore.toNumber()).toBeGreaterThan(0);
  });

  it('detects data inconsistencies (FR3)', () => {
    const res = evaluateFraud(conflictingDataDto);
    const rule = res.ruleResults.find(r => r.ruleId === 'FR3');
    expect(rule).toBeDefined();
    expect(rule.risk.toNumber()).toBeGreaterThan(0);
  });

  it('never auto-denies, only outputs risk scores', () => {
    const res = evaluateFraud(duplicateAidDto);
    expect(res.fraudRiskScore.toNumber()).toBeLessThanOrEqual(1.0);
    expect(res.fraudRiskScore.toNumber()).toBeGreaterThanOrEqual(0);
    // Should flag high risk but NOT change any eligibility field
    const isHighRisk = res.fraudRiskScore.greaterThanOrEqualTo(FRAUD.HIGH_RISK_THRESHOLD);
    if (isHighRisk) {
      expect(res.warnings.some(w => w.includes('HIGH_FRAUD_RISK'))).toBe(true);
    }
  });

  it('returns zero risk for standard unproblematic family', () => {
    const res = evaluateFraud(standardFamilyDto);
    expect(res.fraudRiskScore.toNumber()).toBe(0);
    expect(res.warnings.some(w => w.includes('FRAUD_RISK'))).toBe(false);
  });
});
});
