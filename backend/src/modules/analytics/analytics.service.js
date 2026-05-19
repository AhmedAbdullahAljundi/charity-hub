const prisma = require('../../config/prisma');
const cache = require('../../shared/cache/cache');
const config = require('../../config/env');

const analyticsService = {
  async distribution() {
    const key = cache.CACHE_KEYS.ANALYTICS_DISTRIBUTION;
    const cached = await cache.get(key);
    if (cached) return cached;

    const groups = await prisma.scoreResult.groupBy({
      by: ['systemRecommendation'],
      _count: { _all: true },
      where: {
        calculatedAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
    });

    const data = groups.map((g) => ({
      level: g.systemRecommendation,
      count: g._count._all,
    }));

    const totalHouseholds = await prisma.household.count({ where: { isDraft: false } });
    const pendingDecision = await prisma.scoreResult.count({ where: { humanDecision: 'PENDING' } });
    const fieldVisitRequired = await prisma.scoreResult.count({ where: { reviewStatus: 'FIELD_VISIT_REQUIRED' } });

    const latestScores = await prisma.scoreResult.findMany({
      orderBy: { calculatedAt: 'desc' },
      take: 500,
      select: { layerBreakdown: true },
    });

    const layerTotals = {};
    const layerCounts = {};
    
    for (const score of latestScores) {
      if (!Array.isArray(score.layerBreakdown)) continue;
      for (const layer of score.layerBreakdown) {
        if (!layerTotals[layer.layerId]) {
          layerTotals[layer.layerId] = 0;
          layerCounts[layer.layerId] = 0;
        }
        layerTotals[layer.layerId] += parseFloat(layer.score || 0);
        layerCounts[layer.layerId] += 1;
      }
    }

    const layerAverages = Object.keys(layerTotals).map(layerId => ({
      layerId,
      average: layerTotals[layerId] / layerCounts[layerId]
    })).sort((a, b) => a.layerId.localeCompare(b.layerId));

    const result = {
      byLevel: data,
      totalHouseholds,
      pendingDecision,
      fieldVisitRequired,
      layerAverages
    };

    await cache.set(key, result, config.cache.analyticsTtlSeconds);
    return result;
  },

  async regional() {
    const key = cache.CACHE_KEYS.ANALYTICS_REGIONAL;
    const cached = await cache.get(key);
    if (cached) return cached;

    const latest = await prisma.$queryRaw`
      SELECT DISTINCT ON ("householdId")
        "householdId", "systemRecommendation", "normalizedPercent"
      FROM "ScoreResult"
      ORDER BY "householdId", "calculatedAt" DESC
    `;

    const households = await prisma.household.findMany({
      select: { id: true, governorate: true, district: true },
    });
    const map = new Map(households.map((h) => [h.id, h]));

    const buckets = {};
    for (const score of latest) {
      const h = map.get(score.householdId);
      if (!h) continue;
      const key = `${h.governorate}|${h.district}`;
      if (!buckets[key]) {
        buckets[key] = {
          governorate: h.governorate,
          district: h.district,
          count: 0,
          totalPercent: 0,
          byLevel: {},
        };
      }
      buckets[key].count += 1;
      buckets[key].totalPercent += parseFloat(score.normalizedPercent);
      buckets[key].byLevel[score.systemRecommendation] =
        (buckets[key].byLevel[score.systemRecommendation] || 0) + 1;
    }

    const data = Object.values(buckets).map((b) => ({
      ...b,
      avgPercent: b.count ? b.totalPercent / b.count : 0,
    }));

    await cache.set(key, data, config.cache.analyticsTtlSeconds);
    return data;
  },

  async healthBurden() {
    const scores = await prisma.scoreResult.findMany({
      orderBy: { calculatedAt: 'desc' },
      take: 500,
      select: { layerBreakdown: true },
    });

    let disease = 0;
    let disability = 0;

    for (const s of scores) {
      const layers = s.layerBreakdown;
      if (!Array.isArray(layers)) continue;
      const l6 = layers.find((l) => l.layerId === 'L6');
      if (!l6?.triggeredRules) continue;
      for (const r of l6.triggeredRules) {
        if (String(r.ruleId).startsWith('disease_')) disease += parseFloat(r.points || 0);
        if (String(r.ruleId).startsWith('disability_')) disability += parseFloat(r.points || 0);
      }
    }

    return { diseaseContribution: disease, disabilityContribution: disability };
  },

  async scoreTrends() {
    const rows = await prisma.$queryRaw`
      SELECT date_trunc('month', "calculatedAt") AS month,
             "systemRecommendation" as level,
             AVG("normalizedPercent") AS avg_score,
             COUNT(*)::int AS count
      FROM "ScoreResult"
      GROUP BY 1, 2
      ORDER BY 1 ASC, 2 ASC
    `;
    
    // Pivot data to format: { month: "2023-01", CRITICAL: 90, HIGH_NEED: 75, ... }
    const pivot = {};
    for (const row of rows) {
      if (!row.month) continue;
      const m = new Date(row.month).toISOString().slice(0, 7); // YYYY-MM
      if (!pivot[m]) pivot[m] = { month: m };
      pivot[m][row.level] = parseFloat(row.avg_score).toFixed(1);
    }
    
    return Object.values(pivot).sort((a, b) => a.month.localeCompare(b.month));
  },

  async verificationStats() {
    const groups = await prisma.incomeSource.groupBy({
      by: ['channel', 'verified'],
      _count: { _all: true },
    });
    return groups.map((g) => ({
      channel: g.channel,
      verified: g.verified,
      count: g._count._all,
    }));
  },
};

module.exports = analyticsService;
