const prisma = require('../../config/prisma')

const dashboardRepository = {
  buildMonthlyPanelsRaw: async (monthsWindow = 12) => {
    const now = new Date()
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsWindow + 1, 1))

    return Promise.all([
      prisma.$queryRaw`
        SELECT DATE_TRUNC('month', "created_at") AS m, COUNT(*)::int AS cnt
        FROM families WHERE "created_at" >= ${start} GROUP BY 1 ORDER BY 1 ASC
      `,
      prisma.$queryRaw`
        SELECT DATE_TRUNC('month', "created_at") AS m, SUM(amount)::float AS amt
        FROM incomes WHERE "created_at" >= ${start} GROUP BY 1 ORDER BY 1 ASC
      `,
      prisma.$queryRaw`
        SELECT DATE_TRUNC('month', date) AS m, SUM(amount)::float AS amt
        FROM expenses WHERE date >= ${start} GROUP BY 1 ORDER BY 1 ASC
      `,
      prisma.$queryRaw`
        SELECT DATE_TRUNC('month', date) AS m, SUM(amount)::float AS amt
        FROM assistances WHERE date >= ${start} AND amount IS NOT NULL GROUP BY 1 ORDER BY 1 ASC
      `,
      prisma.$queryRaw`
        SELECT DATE_TRUNC('month', COALESCE(last_service_date, created_at)) AS m, SUM(COALESCE(treatment_cost::float, 0))::float AS amt
        FROM medical_cases WHERE COALESCE(last_service_date, created_at) >= ${start} GROUP BY 1 ORDER BY 1 ASC
      `
    ])
  },

  getStatsAggregates: async () => {
    return Promise.all([
      prisma.family.count(),
      prisma.$queryRaw`
        SELECT DISTINCT ON ("family_id")
          "family_id",
          "total_income"::float AS total_income,
          "total_need"::float AS total_need,
          "vulnerability_index"::float AS vulnerability_index,
          "classification"::text AS classification
        FROM "scorings"
        ORDER BY "family_id", "calculated_at" DESC
      `,
      prisma.medicalCase.count({
        where: { OR: [{ disease_severity: 'CRITICAL' }, { chronic: true }] },
      }),
      prisma.family.count({
        where: { OR: [{ persons: { none: {} } }, { scoringRecords: { none: {} } }] },
      }),
      prisma.$queryRaw`
        SELECT family_id::text, SUM(amount)::float AS total
        FROM expenses GROUP BY family_id
      `,
    ])
  }
}

module.exports = dashboardRepository
