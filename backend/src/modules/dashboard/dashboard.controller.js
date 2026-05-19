/**
 * Dashboard — operational intelligence aggregates.
 * All handlers return HTTP 200 with { success, data, error } so clients can use partial hydration.
 */

const dashboardRepository = require('./dashboard.repository')
const { computePrediction } = require('../../services/dashboard/dashboardPrediction.service')
const { getRegionsOverview } = require('../../services/dashboard/dashboardRegions.service')
const { getWorkflowOverview } = require('../../services/dashboard/dashboardWorkflow.service')

const CHART_PALETTE = {
  VERY_FRAGILE: 'var(--color-destructive)',
  FRAGILE: '#ef4444',
  WEAK: 'var(--color-warning)',
  MODERATE: 'var(--color-chart-4)',
  OUT_OF_PRIORITY: 'var(--color-muted-foreground)',
}

function envelopeSuccess(data) {
  return { success: true, data, error: null }
}

function envelopeFail(code, message) {
  return {
    success: false,
    data: null,
    error: { code, message: message || 'Unknown error' },
  }
}

async function buildMonthlyPanels(monthsWindow = 12) {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsWindow + 1, 1))

  const [famRegs, inc, exp, ast, med] = await dashboardRepository.buildMonthlyPanelsRaw(monthsWindow)

  function mapPivot(rows, keyAmt = 'amt') {
    const m = new Map()
    for (const row of rows) {
      const d = row.m || row.month
      if (!d) continue
      const dt = new Date(d)
      const label = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}`
      m.set(label, Number(row[keyAmt] ?? row.cnt ?? 0) || 0)
    }
    return m
  }

  const famM = mapPivot(famRegs, 'cnt')
  const incM = mapPivot(inc)
  const expM = mapPivot(exp)
  const astM = mapPivot(ast)
  const medM = mapPivot(med)

  const series = []
  for (let i = monthsWindow - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    const k = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    const monthLabelShort = `${d.getUTCMonth() + 1}/${String(d.getUTCFullYear()).slice(-2)}`
    series.push({
      monthKey: k,
      monthLabelShort,
      families: Number(famM.get(k) || 0),
      householdIncome: Math.round(Number(incM.get(k) || 0)),
      householdExpenses: Math.round(Number(expM.get(k) || 0)),
      assistanceCash: Math.round(Number(astM.get(k) || 0)),
      medicalSpend: Math.round(Number(medM.get(k) || 0)),
    })
  }
  return series
}

const CLASS_ORDER = ['VERY_FRAGILE', 'FRAGILE', 'WEAK', 'MODERATE', 'OUT_OF_PRIORITY']

const dashboardController = {
  getStats: async (req, res) => {
    try {
      const [
        [totalFamilies, scoringAggregate, criticalMedical, incompleteFamilies, expenseAggregates],
        monthlySeries
      ] = await Promise.all([
        dashboardRepository.getStatsAggregates(),
        buildMonthlyPanels(12)
      ])

      const scores = Array.isArray(scoringAggregate) ? scoringAggregate : []

      const totalIncome = scores.reduce((sum, s) => sum + Number(s.total_income ?? 0), 0)
      const totalNeed = scores.reduce((sum, s) => sum + Number(s.total_need ?? 0), 0)
      const avgVulnerability =
        scores.length > 0
          ? scores.reduce((sum, s) => sum + Number(s.vulnerability_index ?? 0), 0) / scores.length
          : 0

      const classCount = {}
      for (const k of CLASS_ORDER) classCount[k] = 0
      for (const s of scores) {
        const c = s.classification
        if (c && classCount[c] !== undefined) classCount[c] += 1
      }

      const familyClassification = CLASS_ORDER.map((classificationKey) => ({
        classificationKey,
        value: classCount[classificationKey] || 0,
        fill: CHART_PALETTE[classificationKey] || '#888',
      })).filter((c) => c.value > 0)

      const criticalFamilies = scores.filter(
        (s) => s.classification === 'VERY_FRAGILE' || s.classification === 'FRAGILE'
      ).length

      // Build expense lookup from SQL aggregate (already summed per family)
      const expensesMap = {}
      for (const row of (Array.isArray(expenseAggregates) ? expenseAggregates : [])) {
        expensesMap[row.family_id] = Number(row.total || 0)
      }

      const classificationExpenses = CLASS_ORDER.map((classificationKey) => {
        const totalForClass = scores
          .filter((s) => s.classification === classificationKey)
          .reduce((sum, s) => sum + (expensesMap[s.family_id] || 0), 0)
        return {
          classificationKey,
          value: Math.round(totalForClass),
          fill: CHART_PALETTE[classificationKey],
        }
      }).filter((c) => c.value > 0)

      const financialTrendMonthly = monthlySeries.map((row) => ({
        ...row,
        netHouseholdStress: row.householdExpenses + row.medicalSpend - row.householdIncome,
      }))

      return res.json(
        envelopeSuccess({
          stats: {
            totalFamilies,
            incompleteFamilies,
            criticalFamilies,
            totalIncome: Math.round(totalIncome),
            totalNeed: Math.round(totalNeed),
            vulnerabilityIndex: parseFloat(avgVulnerability.toFixed(4)),
            criticalMedical,
          },
          familyClassification,
          classificationExpenses,
          monthlySeries,
          financialTrendMonthly,
        })
      )
    } catch (error) {
      console.error('[dashboard.getStats]', error)
      return res.status(200).json(envelopeFail('STATS_AGG_FAILED', error.message))
    }
  },

  getPrediction: async (req, res) => {
    try {
      const prediction = await computePrediction()
      return res.json(envelopeSuccess(prediction))
    } catch (e) {
      console.error('[dashboard.getPrediction]', e)
      return res.status(200).json(envelopeFail('PREDICTION_FAILED', e.message))
    }
  },

  getRegionsOverviewHandler: async (req, res) => {
    try {
      const overview = await getRegionsOverview()
      return res.json(envelopeSuccess(overview))
    } catch (e) {
      console.error('[dashboard.getRegionsOverview]', e)
      return res.status(200).json(envelopeFail('REGIONS_FAILED', e.message))
    }
  },

  getWorkflow: async (req, res) => {
    try {
      const workflow = await getWorkflowOverview()
      return res.json(envelopeSuccess(workflow))
    } catch (e) {
      console.error('[dashboard.getWorkflow]', e)
      return res.status(200).json(envelopeFail('WORKFLOW_FAILED', e.message))
    }
  },
}

module.exports = dashboardController
