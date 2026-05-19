/**
 * Fraud Rule 1: Income-Expense Mismatch
 *
 * Flags when declared expenses significantly exceed declared income
 * without a plausible explanation (e.g. family support).
 *
 * Returns a risk score 0–1.
 */

const { ZERO, ONE, toDecimal, div, sum, min } = require('../../../../../shared/utils/decimal');
const { FRAUD } = require('../../../../../shared/constants/weights');

function evaluateFR1(dto) {
  const incomes = dto.incomes || [];
  const expenses = dto.expenses || [];

  const totalIncome = sum(incomes.map(i => toDecimal(i.amount)));
  const totalExpenses = sum(expenses.map(e => toDecimal(e.amount)));

  // Add medical costs
  const medicalCosts = sum((dto.medicalCases || []).map(mc => toDecimal(mc.treatmentCost)));
  const allExpenses = totalExpenses.plus(medicalCosts);

  if (totalIncome.isZero() && allExpenses.isZero()) {
    return { ruleId: 'FR1', risk: ZERO, detail: 'no financial data' };
  }

  if (totalIncome.isZero() && allExpenses.greaterThan(0)) {
    return { ruleId: 'FR1', risk: toDecimal('0.7'), detail: 'expenses with zero income' };
  }

  const ratio = div(allExpenses, totalIncome);

  if (ratio.greaterThan(FRAUD.INCOME_EXPENSE_MISMATCH_THRESHOLD)) {
    // Significant mismatch: max(1, ratio / 3) using Decimal safe math
    const risk = min(ONE, div(ratio, toDecimal('3')));
    return {
      ruleId: 'FR1',
      risk,
      detail: `expense/income ratio = ${ratio.toFixed(2)}`,
    };
  }

  return { ruleId: 'FR1', risk: ZERO, detail: 'within normal range' };
}

module.exports = { evaluateFR1 };
