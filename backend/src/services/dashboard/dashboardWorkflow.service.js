/**
 * Operational workload snapshot — derived purely from Postgres relations.
 */

const prisma = require('../../config/prisma')

async function getWorkflowOverview() {
  try {
  const now = new Date()
  const backlogRegistration = prisma.family.count({
    where: { scoringRecords: { none: {} } },
  })

  const staleScoreCutoff = new Date(now.getTime() - 30 * 86400000)

  const queueRowsRaw =
    /** @type {Array<any>} */
    (
      await prisma.$queryRaw`
    WITH latest AS (
      SELECT DISTINCT ON ("family_id")
        "family_id",
        "calculated_at",
        "vulnerability_index"::float AS vi,
        "classification"::text AS cls
      FROM "scorings"
      ORDER BY "family_id", "calculated_at" DESC
    )
    SELECT
      f.id::text AS fid,
      f.registration_number AS reg,
      f.region AS region,
      l.calculated_at AS scored_at,
      l.vi,
      l.cls
    FROM families f
    INNER JOIN latest l ON l.family_id = f.id
    WHERE l.calculated_at < ${staleScoreCutoff}
      AND l.cls <> 'OUT_OF_PRIORITY'
    ORDER BY l.vi DESC NULLS LAST
    LIMIT 12
  `
    )

  const overdueMedical = prisma.medicalCase.count({
    where: {
      next_allowed_date: { lt: now },
      disease_severity: { in: ['SEVERE', 'CRITICAL'] },
    },
  })

  const [regBacklogCount, overdueN, recentFamiliesRaw, urgentRaw] = await Promise.all([
    backlogRegistration,
    overdueMedical,
    prisma.family.findMany({
      take: 8,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        registration_number: true,
        region: true,
        social_status: true,
        scoringRecords: {
          orderBy: { calculated_at: 'desc' },
          take: 1,
          select: { classification: true, vulnerability_index: true },
        },
      },
    }),
    prisma.$queryRaw`
      WITH latest AS (
        SELECT DISTINCT ON ("family_id")
          "family_id",
          "vulnerability_index"::float AS vi,
          "classification"::text AS cls
        FROM "scorings"
        ORDER BY "family_id", "calculated_at" DESC
      )
      SELECT
        f.id::text AS fid,
        f.registration_number AS reg,
        f.region AS region,
        l.vi,
        l.cls
      FROM families f
      INNER JOIN latest l ON l.family_id = f.id
      WHERE l.cls IN ('VERY_FRAGILE', 'FRAGILE')
      ORDER BY l.vi DESC NULLS LAST
      LIMIT 10
    `,
  ])

  const priorityRowsRaw = urgentRaw /** @type {Array<any>} */ (urgentRaw)

  return {
    registrationBacklogFamilies: regBacklogCount,
    queueRows: queueRowsRaw.map((q) => ({
      id: String(q.fid),
      registration_number: q.reg ?? null,
      region: q.region,
      vulnerabilityIndex: Number(q.vi) || 0,
      classification: q.cls ?? null,
      lastScoredAt: q.scored_at ? new Date(q.scored_at).toISOString() : null,
    })),
    recentFamilies: recentFamiliesRaw.map((f) => ({
      id: f.id,
      registration_number: f.registration_number,
      region: f.region,
      classification: f.scoringRecords[0]?.classification ?? null,
      vulnerabilityIndex:
        f.scoringRecords[0]?.vulnerability_index != null
          ? Number.parseFloat(String(f.scoringRecords[0].vulnerability_index))
          : null,
      social_status: f.social_status,
    })),
    priorityFamilies: priorityRowsRaw.map((u) => ({
      id: String(u.fid),
      registration_number: u.reg ?? null,
      region: u.region,
      vulnerabilityIndex: Number(u.vi) || 0,
      classification: u.cls ?? null,
    })),
    overdueMedicalReviews: overdueN,
    refreshedAt: now.toISOString(),
  }
  } catch (e) {
    console.error('[getWorkflowOverview]', e)
    const now = new Date()
    return {
      registrationBacklogFamilies: 0,
      queueRows: [],
      recentFamilies: [],
      priorityFamilies: [],
      overdueMedicalReviews: 0,
      refreshedAt: now.toISOString(),
    }
  }
}

module.exports = { getWorkflowOverview }
