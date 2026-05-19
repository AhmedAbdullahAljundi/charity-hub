const prisma = require('../../config/prisma');
const { RULES_BY_ID } = require('../../domains/scoring/registry/rulesMetadata');
const { WEIGHTS } = require('../../domains/scoring/registry/weights');
const cache = require('../../shared/cache/cache');
const { NotFoundError } = require('../../utils/errors');
const { logFieldChanges } = require('../../shared/audit/auditLogger');

async function getEffectiveRules() {
  const cached = await cache.get(cache.CACHE_KEYS.RULES_EFFECTIVE);
  if (cached?.rules) {
    return {
      weights: cached.weights,
      rules: cached.rules,
      overrides: cached.overrideMap || cached.overrides,
    };
  }

  const overrides = await prisma.ruleOverride.findMany({ where: { active: true } });
  const overrideMap = Object.fromEntries(
    overrides.map((o) => [o.ruleId, o.overrideValue.toString()])
  );

  const rules = Object.values(RULES_BY_ID).map((meta) => ({
    ...meta,
    effectiveValue: overrideMap[meta.id] ?? meta.defaultValue,
    overridden: Boolean(overrideMap[meta.id]),
  }));

  const payload = { overrideMap, weights: WEIGHTS, rules, overrides: overrideMap };
  await cache.set(
    cache.CACHE_KEYS.RULES_EFFECTIVE,
    payload,
    require('../../config/env').cache.rulesTtlSeconds
  );
  return { weights: WEIGHTS, rules, overrides: overrideMap };
}

const adminService = {
  async listRules() {
    return getEffectiveRules();
  },

  async upsertOverride(user, ruleId, body) {
    if (!RULES_BY_ID[ruleId]) throw new NotFoundError('Rule');
    const row = await prisma.ruleOverride.upsert({
      where: { ruleId },
      create: {
        ruleId,
        overrideValue: body.overrideValue,
        reason: body.reason,
        setById: user.userId,
        active: true,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
      update: {
        overrideValue: body.overrideValue,
        reason: body.reason,
        active: true,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        setAt: new Date(),
      },
    });

    await cache.del(cache.CACHE_KEYS.RULES_EFFECTIVE);

    await logFieldChanges({
      userId: user.userId,
      action: 'RULE_OVERRIDE',
      entity: 'RuleOverride',
      entityId: ruleId,
      changes: [
        {
          fieldName: 'overrideValue',
          before: null,
          after: body.overrideValue,
        },
      ],
    });

    return row;
  },

  async revertOverride(user, ruleId) {
    await prisma.ruleOverride.deleteMany({ where: { ruleId } });
    await cache.del(cache.CACHE_KEYS.RULES_EFFECTIVE);
    return { ruleId, reverted: true };
  },

  async simulateRuleImpact(ruleId) {
    const latestScores = await prisma.scoreResult.findMany({
      orderBy: { calculatedAt: 'desc' },
      distinct: ['householdId'],
      select: { householdId: true, layerBreakdown: true },
    });

    let affected = 0;
    for (const score of latestScores) {
      const breakdown = score.layerBreakdown;
      if (!Array.isArray(breakdown)) continue;
      const hit = breakdown.some((layer) =>
        (layer.triggeredRules || []).some((r) => r.ruleId === ruleId)
      );
      if (hit) affected += 1;
    }

    return { ruleId, affectedHouseholds: affected, sampled: latestScores.length };
  },
};

module.exports = adminService;
