/**
 * Resolves effective weights: cache → DB RuleOverride → static default.
 */

const prisma = require('../../../config/prisma');
const config = require('../../../config/env');
const { toDecimal } = require('../../../shared/utils/decimal');
const { RULES_BY_ID } = require('./rulesMetadata');
const cache = require('../../../shared/cache/cache');

function createResolver(overrideMapObj = {}) {
  const overrideMap = new Map(Object.entries(overrideMapObj));
  const snapshot = {};

  function get(ruleId, fallback) {
    const meta = RULES_BY_ID[ruleId];
    const defaultValue = fallback ?? meta?.defaultValue ?? '0';
    const raw = overrideMap.has(ruleId) ? overrideMap.get(ruleId) : defaultValue;
    snapshot[ruleId] = raw;
    return toDecimal(raw);
  }

  return { get, snapshot };
}

async function loadOverridesFromDb() {
  const overrides = await prisma.ruleOverride.findMany({
    where: { active: true },
    select: { ruleId: true, overrideValue: true, expiresAt: true },
  });

  const now = new Date();
  const map = {};
  for (const row of overrides) {
    if (row.expiresAt && row.expiresAt < now) continue;
    map[row.ruleId] = row.overrideValue.toString();
  }
  return map;
}

async function resolveAll() {
  const cached = await cache.get(cache.CACHE_KEYS.RULES_EFFECTIVE);
  if (cached?.overrideMap) {
    return createResolver(cached.overrideMap);
  }

  const overrideMap = await loadOverridesFromDb();
  await cache.set(
    cache.CACHE_KEYS.RULES_EFFECTIVE,
    { overrideMap },
    config.cache.rulesTtlSeconds
  );
  return createResolver(overrideMap);
}

function resolveStatic() {
  return createResolver({});
}

module.exports = { resolveAll, resolveStatic };
