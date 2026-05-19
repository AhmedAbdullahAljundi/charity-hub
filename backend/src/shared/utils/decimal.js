/**
 * Decimal-safe arithmetic helpers for the scoring engine.
 *
 * ALL scoring math MUST go through these helpers.
 * Never use native JS +, -, *, / on score values.
 */

const Decimal = require('decimal.js');

// Configure Decimal.js for financial-grade precision
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/** Canonical zero */
const ZERO = new Decimal(0);

/** Canonical one */
const ONE = new Decimal(1);

/**
 * Coerce any value to Decimal. Accepts number, string, Prisma Decimal, or Decimal.
 * Returns ZERO for null / undefined / NaN.
 */
function toDecimal(value) {
  if (value === null || value === undefined) return ZERO;
  if (value instanceof Decimal) return value;
  try {
    const d = new Decimal(
      typeof value === 'object' && typeof value.toString === 'function'
        ? value.toString()
        : value
    );
    return d.isNaN() ? ZERO : d;
  } catch {
    return ZERO;
  }
}

/** a + b */
function add(a, b) {
  return toDecimal(a).plus(toDecimal(b));
}

/** a - b */
function sub(a, b) {
  return toDecimal(a).minus(toDecimal(b));
}

/** a * b */
function mul(a, b) {
  return toDecimal(a).times(toDecimal(b));
}

/** a / b  — returns ZERO when b is zero */
function div(a, b) {
  const denominator = toDecimal(b);
  if (denominator.isZero()) return ZERO;
  return toDecimal(a).dividedBy(denominator);
}

/** a ^ b */
function pow(a, b) {
  return toDecimal(a).toPower(toDecimal(b));
}

/** min(a, b) */
function min(a, b) {
  const da = toDecimal(a);
  const db = toDecimal(b);
  return da.lessThanOrEqualTo(db) ? da : db;
}

/** max(a, b) */
function max(a, b) {
  const da = toDecimal(a);
  const db = toDecimal(b);
  return da.greaterThanOrEqualTo(db) ? da : db;
}

/** Clamp value between lo and hi (inclusive) */
function clamp(value, lo, hi) {
  return max(lo, min(value, hi));
}

/** Sum an array of values */
function sum(values) {
  return values.reduce((acc, v) => add(acc, v), ZERO);
}

module.exports = {
  Decimal,
  ZERO,
  ONE,
  toDecimal,
  add,
  sub,
  mul,
  div,
  pow,
  min,
  max,
  clamp,
  sum,
};
