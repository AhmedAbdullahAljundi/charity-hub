/**
 * Smart forecast for next-calendar-month financial pressure / balance proxy.
 *
 * Signals (last 6 full months unless data sparse):
 *  - Household income registrations (Income.amount by month from created_at)
 *  - Household expenses (Expense.amount by date)
 *  - Cash-/monetary-like assistance disbursements (Assistance.amount >= 0)
 *  - Medical treatment cost totals by last_service_date month (critical uplift weighting)
 *
 * Outputs are expressed in numeric currency units (same as stored decimals).
 */

const prisma = require('../../config/prisma')

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n))
}

/** Simple linear extrapolation index 0..n-1 -> next point n */
function linearForecast(values) {
  const pts = values.map((v) => Number(v) || 0)
  const n = pts.length
  if (n === 0) return 0
  if (n === 1) return Math.max(0, pts[0])
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumXX = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += pts[i]
    sumXY += i * pts[i]
    sumXX += i * i
  }
  const denom = n * sumXX - sumX * sumX || 1
  const b = (n * sumXY - sumX * sumY) / denom
  const a = (sumY - b * sumX) / n
  const next = a + b * n
  return Math.max(0, Number.isFinite(next) ? next : pts[n - 1])
}

/** 0–1 confidence from dispersion of observations */
function dispersionConfidence(values) {
  const pts = values.map((v) => Number(v) || 0)
  const n = pts.length
  if (n < 3) return 0.42
  const mean = pts.reduce((s, v) => s + v, 0) / n
  if (mean <= 1e-6)
    return 0.55
  const variance = pts.reduce((s, v) => s + (v - mean) ** 2, 0) / n
  const cv = Math.sqrt(variance) / mean
  return clamp(1 - Math.min(cv, 1) * 0.85 + 0.15, 0.2, 0.92)
}

/**
 * Rows: [{ month_label, incomes, expenses, assistance, medical }], oldest first length<=6+
 */
async function fetchMonthlyMatrices(monthsWindow = 6) {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsWindow, 1))

  /** Month bucket key YYYY-MM */
  function buildMonthlyMap(rows, keyFn) {
    const m = new Map()
    for (const r of rows) {
      const k = keyFn(r)
      if (!k) continue
      m.set(k, (m.get(k) || 0) + (Number.parseFloat(String(r.amount)) || 0))
    }
    return m
  }

  const incomes = await prisma.income.findMany({
    where: { created_at: { gte: start } },
    select: { amount: true, created_at: true },
  })
  const expenses = await prisma.expense.findMany({
    where: { date: { gte: start } },
    select: { amount: true, date: true },
  })
  const assistances = await prisma.assistance.findMany({
    where: { date: { gte: start }, amount: { not: null } },
    select: { amount: true, date: true },
  })
  const medicalSpend = await prisma.medicalCase.findMany({
    where: {
      last_service_date: { gte: start },
      treatment_cost: { not: null },
    },
    select: { treatment_cost: true, disease_severity: true, chronic: true, last_service_date: true },
  })

  const im = buildMonthlyMap(incomes, (r) =>
    `${r.created_at.getUTCFullYear()}-${String(r.created_at.getUTCMonth() + 1).padStart(2, '0')}`)
  const em = buildMonthlyMap(expenses, (r) =>
    `${r.date.getUTCFullYear()}-${String(r.date.getUTCMonth() + 1).padStart(2, '0')}`)
  const am = buildMonthlyMap(assistances, (r) =>
    `${r.date.getUTCFullYear()}-${String(r.date.getUTCMonth() + 1).padStart(2, '0')}`)

  const mm = new Map()
  for (const mc of medicalSpend) {
    if (!mc.last_service_date) continue
    const d = mc.last_service_date
    const k = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    let w = Number.parseFloat(mc.treatment_cost?.toString() || '0') || 0
    if (mc.disease_severity === 'CRITICAL' || mc.chronic === true) w *= 1.35
    mm.set(k, (mm.get(k) || 0) + w)
  }

  const keys = [...new Set([...im.keys(), ...em.keys(), ...am.keys(), ...mm.keys()])].sort()
  /** ensure last exactly `monthsWindow` buckets ending current month-ish */
  const series = []
  for (let i = monthsWindow - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    const k = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    series.push({
      monthKey: k,
      incomes: im.get(k) || 0,
      expenses: em.get(k) || 0,
      assistance: am.get(k) || 0,
      medicalWeighted: mm.get(k) || 0,
    })
  }

  return series
}

function riskLevelFromBalancePredicted(balance, highVariance) {
  const b = Number(balance) || 0
  if (b <= -50000 || (b <= -22000 && highVariance)) return 'HIGH'
  if (b <= 12000 || (b <= 45000 && highVariance)) return 'MEDIUM'
  return 'LOW'
}

async function computePrediction() {
  try {
  const series = await fetchMonthlyMatrices(6)
  const incomeSeries = series.map((s) => s.incomes)
  const expenseSeries = series.map((s) => s.expenses)
  const aidSeries = series.map((s) => s.assistance)
  const medSeries = series.map((s) => s.medicalWeighted)

  const expectedIncome = linearForecast(incomeSeries)
  const expectedExpenses = linearForecast(expenseSeries)
  const expectedAid = linearForecast(aidSeries)
  const expectedMedicalExposure = linearForecast(medSeries)

  /** Latest scoring row per household (PostgreSQL DISTINCT ON — stable with Prisma.raw) */
  const latestScoreRows =
    /** @type {Array<{total_need:number}>} */ (
      await prisma.$queryRaw`
    SELECT DISTINCT ON ("family_id") "total_need"::float AS "total_need"
    FROM "scorings"
    ORDER BY "family_id", "calculated_at" DESC
  `
    )

  /** Sustained need pressure amortized monthly from current PMT snapshots */
  let needPressureMonthly = 0
  if (latestScoreRows?.length) {
    const totalNeedAgg = latestScoreRows.reduce((s, r) => s + (Number(r.total_need) || 0), 0)
    needPressureMonthly = totalNeedAgg / 12
  }

  /** Critical cases tail cost next month heuristic: recent avg of CRITICAL weighted medical */
  const critAgg = await prisma.medicalCase.aggregate({
    _avg: { treatment_cost: true },
    where: { OR: [{ disease_severity: 'CRITICAL' }, { chronic: true }] },
  })
  const avgCrit = Number.parseFloat(critAgg._avg.treatment_cost?.toString() || '0') || 0
  const criticalCount = await prisma.medicalCase.count({
    where: { OR: [{ disease_severity: 'CRITICAL' }, { chronic: true }] },
  })

  /** predicted organization-side balance proxy (negative = escalating cash pressure) */
  const budgetApproved = Number.parseFloat(process.env.BUDGET_APPROVED_TOTAL || '0') || 0
  const spentLike =
    expenseSeries.reduce((s, v) => s + v, 0) / Math.max(1, expenseSeries.filter((x) => x > 0).length || series.length)

  /** rolling baseline slack if configured */
  let predictedBalance =
    budgetApproved > 0
      ? budgetApproved -
        spentLike -
        expectedAid -
        expectedMedicalExposure -
        needPressureMonthly * 0.4 -
        avgCrit * Math.min(criticalCount, 40) * 0.08
      : expectedIncome -
        expectedExpenses -
        expectedAid -
        expectedMedicalExposure -
        needPressureMonthly * 0.25 -
        avgCrit * Math.min(criticalCount, 40) * 0.06

  const dispersionVec = [...incomeSeries, ...expenseSeries, ...aidSeries]
  let predictionConfidencePct = Math.round(dispersionConfidence(dispersionVec) * 100)

  /** Escalate risk band when inbound income series is unstable vs smoothed outlook */
  const incMean = incomeSeries.reduce((s, x) => s + x, 0) / Math.max(1, incomeSeries.length)
  const incMax = incomeSeries.length ? Math.max(...incomeSeries) : 0
  const incMin = incomeSeries.length ? Math.min(...incomeSeries) : 0
  const highVariance = incMean > 0 && incMax - incMin > Math.max(incMean * 1.85, expectedIncome * 0.95)

  const financialRiskLevel = riskLevelFromBalancePredicted(predictedBalance, highVariance)

  return {
    predictedBalance: Math.round(predictedBalance),
    predictionConfidence: predictionConfidencePct,
    predictionConfidenceRaw: dispersionConfidence(dispersionVec),
    expectedIncome: Math.round(expectedIncome),
    expectedExpenses: Math.round(expectedExpenses),
    expectedAid: Math.round(expectedAid),
    expectedMedicalExposure: Math.round(expectedMedicalExposure),
    needPressureMonthly: Math.round(needPressureMonthly),
    criticalMedicalSignals: criticalCount,
    avgCriticalTreatmentCost: Math.round(avgCrit),
    financialRiskLevel,
    seriesMeta: series,
  }
  } catch (e) {
    console.error('[computePrediction]', e)
    return {
      predictedBalance: 0,
      predictionConfidence: 0,
      predictionConfidenceRaw: 0,
      expectedIncome: 0,
      expectedExpenses: 0,
      expectedAid: 0,
      expectedMedicalExposure: 0,
      needPressureMonthly: 0,
      criticalMedicalSignals: 0,
      avgCriticalTreatmentCost: 0,
      financialRiskLevel: 'MEDIUM',
      seriesMeta: [],
    }
  }
}

module.exports = {
  computePrediction,
  linearForecast,
  fetchMonthlyMatrices,
}
