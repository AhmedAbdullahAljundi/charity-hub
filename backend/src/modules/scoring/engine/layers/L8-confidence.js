/**
 * Layer 8: Confidence Engine
 *
 * Measures trust in the submitted data (0–1 scale):
 * - Data completeness
 * - Income verification ratio
 * - Document presence (national IDs)
 * - Data recency
 *
 * KEY PRINCIPLE: Low confidence ≠ denial.
 *   Low confidence → "Needs Field Review" flag.
 *
 * Cap: 1.0
 */

const { ZERO, ONE, toDecimal, add, div, mul, clamp } = require('../../../../shared/utils/decimal');
const { L8, LAYER_CAPS } = require('../../../../shared/constants/weights');
const { createLayerResult, triggeredRule, skippedRule } = require('../layer-result');

function calculateL8(dto) {
  const rules = [];
  const skipped = [];
  const warnings = [];

  const members = dto.members || [];
  const incomes = dto.incomes || [];

  // ── Data completeness (40% weight) ──
  let filledFields = 0;
  let totalFields = 0;

  // Family-level fields
  const familyChecks = [dto.housingType, dto.address, dto.phone, dto.socialStatus, dto.region];
  totalFields += familyChecks.length;
  filledFields += familyChecks.filter(v => v != null && v !== '').length;

  // Per-member fields
  for (const m of members) {
    const memberChecks = [m.name, m.nationalId, m.role, m.gender, m.birthDate, m.educationLevel];
    totalFields += memberChecks.length;
    filledFields += memberChecks.filter(v => v != null && v !== '').length;
  }

  const completenessRatio = totalFields > 0 ? div(filledFields, totalFields) : ZERO;
  const completenessScore = mul(completenessRatio, L8.COMPLETENESS_WEIGHT);
  rules.push(triggeredRule(
    'L8_COMPLETE', 
    'data_completeness', 
    `Completeness ratio: ${filledFields}/${totalFields} fields populated`, 
    'L8.COMPLETENESS_WEIGHT', 
    completenessScore, 
    completenessScore
  ));

  // ── Income verification (30% weight) ──
  let verificationScore;
  if (incomes.length > 0) {
    const verifiedCount = incomes.filter(i => i.verified).length;
    const verificationRatio = div(verifiedCount, incomes.length);
    verificationScore = mul(verificationRatio, L8.VERIFICATION_WEIGHT);
    rules.push(triggeredRule(
      'L8_VERIFY', 
      'income_verification', 
      `Verified income sources: ${verifiedCount}/${incomes.length}`, 
      'L8.VERIFICATION_WEIGHT', 
      verificationScore, 
      verificationScore
    ));
  } else {
    verificationScore = ZERO;
    skipped.push(skippedRule('L8_VERIFY', 'income_verification', 'no income sources to verify'));
  }

  // ── Document presence — national IDs (20% weight) ──
  let docScore;
  if (members.length > 0) {
    const withId = members.filter(m => m.nationalId && m.nationalId.length >= 10).length;
    const docRatio = div(withId, members.length);
    docScore = mul(docRatio, L8.DOCUMENTS_WEIGHT);
    rules.push(triggeredRule(
      'L8_DOCS', 
      'document_presence', 
      `National ID presence: ${withId}/${members.length} members`, 
      'L8.DOCUMENTS_WEIGHT', 
      docScore, 
      docScore
    ));
  } else {
    docScore = ZERO;
  }

  // ── Data recency (10% weight) ──
  let recencyScore;
  const updatedAt = dto.updatedAt ? new Date(dto.updatedAt) : null;
  if (updatedAt) {
    const daysSinceUpdate = Math.floor((Date.now() - updatedAt.getTime()) / 86400000);
    if (daysSinceUpdate <= L8.STALE_DATA_DAYS) {
      recencyScore = L8.RECENCY_WEIGHT;
      rules.push(triggeredRule(
        'L8_RECENCY', 
        'data_recency', 
        `Data was updated ${daysSinceUpdate} days ago`, 
        'L8.RECENCY_WEIGHT', 
        recencyScore, 
        recencyScore
      ));
    } else {
      recencyScore = mul(L8.RECENCY_WEIGHT, 0.3); // stale data gets partial credit
      warnings.push(`Data is ${daysSinceUpdate} days old — may be stale`);
      rules.push(triggeredRule(
        'L8_RECENCY', 
        'data_stale', 
        `Data is stale (${daysSinceUpdate} days ago)`, 
        'L8.RECENCY_WEIGHT', 
        recencyScore, 
        recencyScore
      ));
    }
  } else {
    recencyScore = mul(L8.RECENCY_WEIGHT, 0.5);
    rules.push(triggeredRule(
      'L8_RECENCY', 
      'data_recency_unknown', 
      'No update timestamp provided, assuming partial recency', 
      'L8.RECENCY_WEIGHT', 
      recencyScore, 
      recencyScore
    ));
  }

  // ── Total confidence score (0–1) ──
  const totalConfidence = clamp(
    add(add(add(completenessScore, verificationScore), docScore), recencyScore),
    ZERO,
    ONE
  );

  // Flag low confidence
  if (totalConfidence.lessThan(L8.LOW_CONFIDENCE_THRESHOLD)) {
    warnings.push('LOW_CONFIDENCE: Needs field review — data trust is below threshold');
  }

  return createLayerResult('L8', totalConfidence, LAYER_CAPS.L8_CONFIDENCE, rules, skipped, warnings);
}

module.exports = { calculateL8 };
