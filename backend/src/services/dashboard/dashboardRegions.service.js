/**
 * Regional aggregates for command-center monitoring.
 *
 * supervisorsCount: distinct Assistance.provider_name touching the region last 180d (operational coordinators).
 * pendingResearch: families whose latest scoring is older than 45 days OR have no scoring.
 */

const prisma = require('../../config/prisma')

async function getRegionsOverview() {
  try {
  const rows =
    /** @type {Array<Record<string, unknown>>} */ (
      await prisma.$queryRaw`
    WITH fam AS (
      SELECT
        id,
        COALESCE(NULLIF(TRIM(region), ''), '__UNSPECIFIED') AS r
      FROM families
    ),
    latest_scoring AS (
      SELECT DISTINCT ON (family_id)
        family_id,
        vulnerability_index::float AS vi,
        calculated_at
      FROM scorings
      ORDER BY family_id, calculated_at DESC
    ),
    crit_family AS (
      SELECT p.family_id, COUNT(mc.id)::int AS crit_n
      FROM medical_cases mc
      INNER JOIN persons p ON p.id = mc.person_id
      WHERE (mc.disease_severity::text = 'CRITICAL'
         OR mc.chronic = true)
      GROUP BY p.family_id
    ),
    pending AS (
      SELECT f.id AS family_id,
        CASE WHEN ls.calculated_at IS NULL THEN TRUE
             WHEN ls.calculated_at < (CURRENT_TIMESTAMP - INTERVAL '45 days')
             THEN TRUE ELSE FALSE END AS needs_research
      FROM families f
      LEFT JOIN latest_scoring ls ON ls.family_id = f.id
    ),
    coordinators AS (
      SELECT
        COALESCE(NULLIF(TRIM(f.region), ''), '__UNSPECIFIED') AS r,
        COUNT(DISTINCT TRIM(a.provider_name))::int AS coords
      FROM assistances a
      INNER JOIN families f ON f.id = a.family_id
      WHERE a.provider_name IS NOT NULL
        AND LENGTH(TRIM(a.provider_name)) > 0
        AND a.date >= (CURRENT_TIMESTAMP - INTERVAL '180 days')
      GROUP BY COALESCE(NULLIF(TRIM(f.region), ''), '__UNSPECIFIED')
    )
    SELECT
      fam.r AS "regionLabel",
      COUNT(DISTINCT fam.id)::int AS "familiesCount",
      ROUND(COALESCE(AVG(ls.vi), 0)::numeric, 4)::float AS "averageVulnerability",
      COALESCE(SUM(crit_family.crit_n), 0)::int AS "criticalCases",
      COUNT(DISTINCT fam.id) FILTER (
        WHERE pending.needs_research = TRUE
      )::int AS "pendingResearch",
      COALESCE(MAX(coord.coords), 0)::int AS "supervisorsCount"
    FROM fam
    LEFT JOIN latest_scoring ls ON ls.family_id = fam.id
    LEFT JOIN crit_family ON crit_family.family_id = fam.id
    LEFT JOIN pending ON pending.family_id = fam.id
    LEFT JOIN coordinators AS coord ON coord.r = fam.r
    GROUP BY fam.r
    ORDER BY fam.r ASC
  `
    )

  return rows.map((r) => ({
    region: formatRegionExport(String(r.regionLabel ?? '')),
    regionKey: String(r.regionLabel ?? ''),
    familiesCount: Number(r.familiesCount) || 0,
    pendingResearch: Number(r.pendingResearch) || 0,
    criticalCases: Number(r.criticalCases) || 0,
    supervisorsCount: Number(r.supervisorsCount) || 0,
    averageVulnerability: Number(r.averageVulnerability) || 0,
  }))
  } catch (err) {
    console.error('[getRegionsOverview]', err)
    return []
  }
}

function formatRegionExport(key) {
  if (key === '__UNSPECIFIED') return '__UNSPECIFIED'
  return key
}

module.exports = { getRegionsOverview, formatRegionExport }
