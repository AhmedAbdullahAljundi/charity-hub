/**
 * Fraud Engine
 *
 * Runs all fraud detection rules and returns an aggregate fraud risk score (0–1).
 *
 * KEY PRINCIPLE: Fraud flag triggers review workflow, NEVER auto-denial.
 */

const { ZERO, toDecimal, add, mul, clamp } = require('../../../../shared/utils/decimal');
const { FRAUD } = require('../../../../shared/constants/weights');
const { evaluateFR1 } = require('./rules/FR1-income-expense-mismatch');
const { evaluateFR2 } = require('./rules/FR2-duplicate-benefits');
const { evaluateFR3 } = require('./rules/FR3-data-inconsistency');

/**
 * @param {Object} dto — household DTO
 * @returns {{ fraudRiskScore: Decimal, ruleResults: Array, warnings: string[] }}
 */
function evaluateFraud(dto) {
  const ruleResults = [];
  const warnings = [];

  // Run all fraud rules
  const fr1 = evaluateFR1(dto);
  const fr2 = evaluateFR2(dto);
  const fr3 = evaluateFR3(dto);

  ruleResults.push(fr1, fr2, fr3);

  // Weighted average
  const weightedScore = add(
    add(
      mul(fr1.risk, FRAUD.INCOME_EXPENSE_WEIGHT),
      mul(fr2.risk, FRAUD.DUPLICATE_BENEFITS_WEIGHT)
    ),
    mul(fr3.risk, FRAUD.DATA_INCONSISTENCY_WEIGHT)
  );

  const fraudRiskScore = clamp(weightedScore, ZERO, toDecimal(1));

  // Flag high risk
  if (fraudRiskScore.greaterThanOrEqualTo(FRAUD.HIGH_RISK_THRESHOLD)) {
    warnings.push('HIGH_FRAUD_RISK: Triggers review workflow — NOT auto-denial');
  }

  // Flag moderate risk
  if (fraudRiskScore.greaterThanOrEqualTo(toDecimal('0.3')) && fraudRiskScore.lessThan(FRAUD.HIGH_RISK_THRESHOLD)) {
    warnings.push('MODERATE_FRAUD_RISK: Some data contradictions detected');
  }

  return { fraudRiskScore, ruleResults, warnings };
}

module.exports = { evaluateFraud };
