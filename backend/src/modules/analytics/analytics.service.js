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
    const unverifiedCount = await prisma.incomeSource.count({ where: { verified: 'UNVERIFIED' } });
    const unverifiedPensionCount = await prisma.incomeSource.count({ where: { verified: 'UNVERIFIED', channel: 'PENSION' } });
    
    // For total penalty applied, we sum the penalty rules from ScoreResult
    const recentScores = await prisma.scoreResult.findMany({
      orderBy: { calculatedAt: 'desc' },
      distinct: ['householdId'],
      select: { layerBreakdown: true }
    });
    let penalty = 0;
    for (const score of recentScores) {
      if (!Array.isArray(score.layerBreakdown)) continue;
      const l8 = score.layerBreakdown.find(l => l.layerId === 'L8');
      if (l8 && l8.triggeredRules) {
        for (const r of l8.triggeredRules) {
          if (r.ruleId === 'income_low_verify') penalty += Math.abs(parseFloat(r.points || 0));
        }
      }
    }

    return {
      unverifiedCount,
      unverifiedPensionCount,
      totalPenaltyApplied: penalty
    };
  },

  async expenseDistribution() {
    const data = await prisma.household.groupBy({
      by: ['classificationTag'],
      where: { classificationTag: { not: null }, isDraft: false },
      _count: { id: true },
    });

    return data.map((row) => ({
      category: row.classificationTag,
      count: row._count.id,
    }));
  },

  async financialTrend() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const rows = await prisma.$queryRaw`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "calculatedAt"), 'YYYY-MM') AS month,
        "systemRecommendation" AS level,
        ROUND(AVG("normalizedPercent")::numeric, 1) AS avg_score,
        COUNT(*) AS count
      FROM "ScoreResult"
      WHERE "calculatedAt" >= ${sixMonthsAgo}
      GROUP BY 1, 2
      ORDER BY 1
    `;

    const pivot = {};
    for (const row of rows) {
      if (!pivot[row.month]) pivot[row.month] = { month: row.month };
      pivot[row.month][row.level] = parseFloat(row.avg_score);
    }

    return Object.values(pivot);
  },

  /**
   * dashboardSummary — endpoint موحّد يجمع كل بيانات الداشبورد في طلب واحد.
   * يحل: مشاكل 1 (stats)، 2 (workflow)، 3 (prediction)، 4 (regions)، 5 (monthlySeries)، 6 (classificationExpenses)
   */
  async dashboardSummary() {
    const cacheKey = 'dashboard:summary';
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // ── نفّذ كل الاستعلامات بالتوازي ──────────────────────────────
    const [
      totalFamilies,
      criticalFamilies,
      criticalMedical,
      incompleteFamilies,
      pendingDecision,
      fieldVisitRequired,
      recentHouseholds,
      priorityScores,
      backlogCount,
      overdueMedical,
      regionalRaw,
      supervisorsByGov,
      disbursementMonths,
      medicalDisbMonthly,
      classificationDist,
      familyClassRaw,
    ] = await Promise.all([
      // إجمالي الأسر المسجلة (غير مسودة)
      prisma.household.count({ where: { isDraft: false } }),

      // الأسر الحرجة جداً (systemRecommendation = CRITICAL) من آخر تقييم لكل أسرة
      prisma.scoreResult.count({
        where: {
          systemRecommendation: 'CRITICAL',
          humanDecision: 'PENDING',
        },
      }),

      // حالات طبية حرجة نشطة
      prisma.medicalCase.count({ where: { isCritical: true, isActive: true } }),

      // أسر مسجلة بدون تقييم (isDraft=false لكن لا توجد ScoreResult)
      prisma.household.count({
        where: {
          isDraft: false,
          scoreResults: { none: {} },
        },
      }),

      // قرارات معلّقة
      prisma.scoreResult.count({ where: { humanDecision: 'PENDING' } }),

      // تحتاج زيارة ميدانية
      prisma.scoreResult.count({ where: { reviewStatus: 'FIELD_VISIT_REQUIRED' } }),

      // آخر 5 أسر مسجّلة
      prisma.household.findMany({
        where: { isDraft: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          code: true,
          familyName: true,
          governorate: true,
          district: true,
          createdAt: true,
          classificationTag: true,
          humanDecision: true,
        },
      }),

      // أعلى 5 أسر بالدرجة (أشد احتياجاً)
      prisma.scoreResult.findMany({
        orderBy: { normalizedPercent: 'desc' },
        distinct: ['householdId'],
        take: 5,
        select: {
          householdId: true,
          normalizedPercent: true,
          systemRecommendation: true,
          household: {
            select: {
              code: true,
              familyName: true,
              governorate: true,
              district: true,
              classificationTag: true,
            },
          },
        },
      }),

      // عدد الأسر الجديدة المسجّلة التي لم تُقيَّم بعد
      prisma.household.count({
        where: { isDraft: false, scoreResults: { none: {} } },
      }),

      // حالات طبية متأخرة عن المراجعة (أكثر من 30 يوم)
      prisma.medicalCase.count({
        where: {
          isActive: true,
          createdAt: { lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),

      // البيانات حسب المنطقة (addressRegion أو district — داخل القرية الواحدة)
      prisma.$queryRaw`
        SELECT DISTINCT ON (h.id)
          COALESCE(NULLIF(h."addressRegion", ''), NULLIF(h.district, ''), 'غير محدد') AS area,
          sr."systemRecommendation",
          sr."normalizedPercent"
        FROM "Household" h
        LEFT JOIN "ScoreResult" sr ON sr."householdId" = h.id
        WHERE h."isDraft" = false
        ORDER BY h.id, sr."calculatedAt" DESC
      `,

      // عدد المتطوعين والمشرفين لكل منطقة (district)
      prisma.user.groupBy({
        by: ['assignedDistrict'],
        where: { role: 'SUPERVISOR', active: true, assignedDistrict: { not: null } },
        _count: { id: true },
      }),

      // بيانات الصرف الشهري (آخر 6 أشهر)
      prisma.disbursementMonth.findMany({
        where: { period: { gte: sixMonthsAgo } },
        orderBy: { period: 'asc' },
        select: {
          period: true,
          status: true,
          payments: {
            select: {
              totalIncome: true,
              finalAmount: true,
              calculatedAmount: true,
            },
          },
        },
      }),

      // الصرف الطبي الشهري
      prisma.$queryRaw`
        SELECT
          TO_CHAR(DATE_TRUNC('month', "disbursementDate"), 'YYYY-MM') AS month,
          SUM(amount)::numeric AS total_medical
        FROM "MedicalDisbursement"
        WHERE "disbursementDate" >= ${sixMonthsAgo}
          AND status IN ('APPROVED', 'PAID')
        GROUP BY 1
        ORDER BY 1
      `,

      // توزيع الأسر حسب classificationTag (للـ expense donut)
      prisma.household.groupBy({
        by: ['classificationTag'],
        where: { classificationTag: { not: null }, isDraft: false },
        _count: { id: true },
      }),

      // توزيع الأسر حسب systemRecommendation (للـ classification donut)
      prisma.scoreResult.groupBy({
        by: ['systemRecommendation'],
        _count: { _all: true },
        where: {
          calculatedAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    // ── بناء monthlySeries ─────────────────────────────────────────
    const medicalByMonth = {};
    for (const row of medicalDisbMonthly) {
      medicalByMonth[row.month] = parseFloat(row.total_medical || 0);
    }

    const ARABIC_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

    const monthlySeries = disbursementMonths.map((dm) => {
      const monthKey = dm.period.toISOString().slice(0, 7);
      const monthIdx = dm.period.getMonth();
      const totalIncome = dm.payments.reduce((s, p) => s + parseFloat(p.totalIncome || 0), 0);
      const totalExpenses = dm.payments.reduce((s, p) => s + parseFloat(p.finalAmount || 0), 0);
      return {
        month: monthKey,
        monthLabelShort: ARABIC_MONTHS[monthIdx],
        householdIncome: Math.round(totalIncome),
        householdExpenses: Math.round(totalExpenses),
        medicalSpend: Math.round(medicalByMonth[monthKey] || 0),
      };
    });

    // ── prediction من آخر 3 أشهر ──────────────────────────────────
    const last3 = monthlySeries.slice(-3);
    let prediction = null;
    if (last3.length >= 2) {
      const avgIncome = last3.reduce((s, m) => s + m.householdIncome, 0) / last3.length;
      const avgExpenses = last3.reduce((s, m) => s + m.householdExpenses, 0) / last3.length;
      const avgMedical = last3.reduce((s, m) => s + m.medicalSpend, 0) / last3.length;
      const predictedBalance = Math.round(avgIncome - avgExpenses - avgMedical);
      const volatility = last3.length > 1
        ? Math.abs(last3[last3.length - 1].householdExpenses - last3[0].householdExpenses) / (avgExpenses || 1)
        : 0;
      const financialRiskLevel = volatility > 0.3 ? 'HIGH' : volatility > 0.1 ? 'MEDIUM' : 'LOW';
      prediction = {
        predictedBalance,
        predictionConfidence: Math.round(70 + (1 - Math.min(volatility, 1)) * 25),
        expectedIncome: Math.round(avgIncome),
        expectedExpenses: Math.round(avgExpenses),
        expectedAid: Math.round(avgExpenses),
        expectedMedicalExposure: Math.round(avgMedical),
        financialRiskLevel,
        criticalMedicalSignals: criticalMedical,
      };
    }

    // ── البيانات حسب المنطقة الداخلية ────────────────────────────
    const areaBuckets = {};
    for (const row of regionalRaw) {
      const key = row.area || 'غير محدد';
      if (!areaBuckets[key]) {
        areaBuckets[key] = {
          region: key,
          familiesCount: 0,
          totalPercent: 0,
          criticalCases: 0,
          pendingResearch: 0,
        };
      }
      areaBuckets[key].familiesCount += 1;
      areaBuckets[key].totalPercent += parseFloat(row.normalizedPercent || 0);
      if (row.systemRecommendation === 'CRITICAL') areaBuckets[key].criticalCases += 1;
      if (!row.systemRecommendation) areaBuckets[key].pendingResearch += 1;
    }

    const supMap = {};
    for (const s of supervisorsByGov) {
      if (s.assignedDistrict) supMap[s.assignedDistrict] = s._count.id;
    }

    const regionsOverview = Object.values(areaBuckets).map((b) => ({
      region: b.region,
      regionKey: b.region,
      familiesCount: b.familiesCount,
      pendingResearch: b.pendingResearch,
      criticalCases: b.criticalCases,
      supervisorsCount: supMap[b.region] || 0,
      averageVulnerability: b.familiesCount > 0 ? b.totalPercent / b.familiesCount : 0,
    }));

    // ── workflow (الأسر الأخيرة والأولوية) ────────────────────────
    const workflow = {
      recentFamilies: recentHouseholds.map((h) => ({
        id: h.id,
        code: h.code,
        name: h.familyName || '—',
        region: `${h.governorate} / ${h.district}`,
        classificationTag: h.classificationTag,
        humanDecision: h.humanDecision,
        createdAt: h.createdAt,
      })),
      priorityFamilies: priorityScores.map((s) => ({
        id: s.householdId,
        code: s.household?.code || '—',
        name: s.household?.familyName || '—',
        region: s.household ? `${s.household.governorate} / ${s.household.district}` : '—',
        score: parseFloat(s.normalizedPercent),
        level: s.systemRecommendation,
        classificationTag: s.household?.classificationTag,
      })),
      queueRows: [],
      registrationBacklogFamilies: backlogCount,
      overdueMedicalReviews: overdueMedical,
    };

    // ── تصنيف الأسر (classification donut) ────────────────────────
    const CLASSIFICATION_COLORS = {
      CRITICAL: 'var(--chart-1)',
      HIGH_NEED: 'var(--chart-2)',
      MODERATE_NEED: 'var(--chart-3)',
      LOW_NEED: 'var(--chart-4)',
      NOT_ELIGIBLE: 'var(--chart-5)',
    };

    const familyClassification = familyClassRaw.map((g) => ({
      classificationKey: g.systemRecommendation,
      value: g._count._all,
      fill: CLASSIFICATION_COLORS[g.systemRecommendation] || 'var(--muted)',
    }));

    // ── توزيع المصروفات (expense donut) ───────────────────────────
    const classificationExpenses = classificationDist
      .filter((r) => r.classificationTag)
      .map((r) => ({
        classificationKey: r.classificationTag,
        value: r._count.id,
      }));

    const result = {
      stats: {
        totalFamilies,
        criticalFamilies,
        criticalMedical,
        incompleteFamilies,
        pendingDecision,
        fieldVisitRequired,
        totalNeed: pendingDecision,
      },
      monthlySeries,
      prediction,
      regionsOverview,
      workflow,
      familyClassification,
      classificationExpenses,
    };

    await cache.set(cacheKey, result, config.cache.analyticsTtlSeconds || 300);
    return result;
  },
};

module.exports = analyticsService;
