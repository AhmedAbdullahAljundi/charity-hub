const prisma = require('../../config/prisma');
const { NotFoundError } = require('../../utils/errors');
const { assertHouseholdAccessById } = require('../../shared/householdAccess');
const { runScoringPipeline } = require('../../domains/scoring/engine/pipeline');
const { decimalToString } = require('../../shared/serializers');
const cache = require('../../shared/cache/cache');
const config = require('../../config/env');

function serializeScoreResult(row) {
  if (!row) return row;
  return {
    ...row,
    vulnerabilityScore: decimalToString(row.vulnerabilityScore),
    reductionScore: decimalToString(row.reductionScore),
    confidenceScore: decimalToString(row.confidenceScore),
    fraudRiskScore: decimalToString(row.fraudRiskScore),
    finalScore: decimalToString(row.finalScore),
    normalizedPercent: decimalToString(row.normalizedPercent),
    previousScore: decimalToString(row.previousScore),
    scoreDelta: decimalToString(row.scoreDelta),
  };
}

const scoringService = {
  async calculate(user, householdId) {
    await assertHouseholdAccessById(user, householdId);
    const result = await runScoringPipeline(householdId, { persist: true });
    await cache.delPattern('analytics:');
    return result;
  },

  async getHistory(user, householdId) {
    await assertHouseholdAccessById(user, householdId);
    const rows = await prisma.scoreResult.findMany({
      where: { householdId },
      orderBy: { calculatedAt: 'desc' },
    });
    return rows.map(serializeScoreResult);
  },

  async getLatest(user, householdId) {
    await assertHouseholdAccessById(user, householdId);
    const row = await prisma.scoreResult.findFirst({
      where: { householdId },
      orderBy: { calculatedAt: 'desc' },
      include: {
        household: {
          select: {
            humanDecision: true,
            reviewStatus: true,
            decisionNote: true,
            classificationTag: true,
            decidedAt: true,
            decidedById: true,
          },
        },
      },
    });
    if (!row) return null;
    return {
      ...serializeScoreResult(row),
      humanDecision: row.household.humanDecision,
      reviewStatus: row.household.reviewStatus,
      decisionNote: row.household.decisionNote,
      classificationTag: row.household.classificationTag,
      decidedAt: row.household.decidedAt,
    };
  },

  async decide(user, householdId, body) {
    await assertHouseholdAccessById(user, householdId);

    // Verify a score exists before allowing a decision.
    const latest = await prisma.scoreResult.findFirst({
      where: { householdId },
      orderBy: { calculatedAt: 'desc' },
    });
    if (!latest) throw new NotFoundError('ScoreResult');

    const updatedHousehold = await prisma.household.update({
      where: { id: householdId },
      data: {
        humanDecision: body.humanDecision,
        reviewStatus: body.reviewStatus,
        decisionNote: body.decisionNote,
        classificationTag: body.categoryClass ?? null,
        decidedById: user.userId,
        decidedAt: new Date(),
      },
      select: {
        humanDecision: true,
        reviewStatus: true,
        decisionNote: true,
        classificationTag: true,
        decidedAt: true,
        decidedById: true,
      },
    });

    return {
      ...serializeScoreResult(latest),
      humanDecision: updatedHousehold.humanDecision,
      reviewStatus: updatedHousehold.reviewStatus,
      decisionNote: updatedHousehold.decisionNote,
      classificationTag: updatedHousehold.classificationTag,
      decidedAt: updatedHousehold.decidedAt,
    };
  },
};

module.exports = scoringService;
