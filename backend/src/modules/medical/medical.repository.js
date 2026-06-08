const prisma = require('../../config/prisma')

const CASE_INCLUDE = {
  person: { select: { id: true, name: true, gender: true, birthDate: true, isBride: true } },
  household: {
    select: {
      id: true, code: true,
      persons: { select: { id: true, name: true } },
      scoreResults: {
        orderBy: { calculatedAt: 'desc' },
        take: 1,
        select: {
          normalizedPercent: true,
          systemRecommendation: true,
          humanDecision: true,
          reviewStatus: true,
          assistanceType: true,
          classificationTag: true,
        }
      }
    }
  },
  disbursements: {
    orderBy: { disbursementDate: 'desc' },
    include: { approvedBy: { select: { id: true, name: true } } }
  },
  createdBy: { select: { id: true, name: true } }
}

// ─── MedicalCase ──────────────────────────────────────────

async function findAllCases({ search, aidType, criticalOnly, isActive, page = 1, limit = 10 }) {
  const skip = (page - 1) * limit
  const where = {
    AND: [
      search ? {
        OR: [
          { conditionName: { contains: search, mode: 'insensitive' } },
          { person: { name: { contains: search, mode: 'insensitive' } } },
          { household: { code: { contains: search, mode: 'insensitive' } } },
          { household: { persons: { some: { name: { contains: search, mode: 'insensitive' } } } } },
        ]
      } : {},
      criticalOnly ? { isCritical: true } : {},
      isActive !== undefined ? { isActive } : {},
    ]
  }

  const [cases, total] = await Promise.all([
    prisma.medicalCase.findMany({
      where,
      include: CASE_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.medicalCase.count({ where })
  ])

  return { cases, total, page, limit, totalPages: Math.ceil(total / limit) }
}

async function findCaseById(id) {
  return prisma.medicalCase.findUnique({ where: { id }, include: CASE_INCLUDE })
}

async function findCasesByHousehold(householdId) {
  return prisma.medicalCase.findMany({
    where: { householdId },
    include: CASE_INCLUDE,
    orderBy: { createdAt: 'desc' }
  })
}

async function createCase(data) {
  return prisma.medicalCase.create({ data, include: CASE_INCLUDE })
}

async function updateCase(id, data) {
  return prisma.medicalCase.update({ where: { id }, data, include: CASE_INCLUDE })
}

async function deleteCase(id) {
  return prisma.medicalCase.delete({ where: { id } })
}

// ─── MedicalDisbursement ──────────────────────────────────

async function findAllDisbursements({ status, aidType, search, page = 1, limit = 20 } = {}) {
  const skip = (Math.max(1, Number(page)) - 1) * Number(limit)
  const where = {
    AND: [
      status ? { status } : {},
      aidType ? { aidType } : {},
      search ? {
        OR: [
          { person: { name: { contains: search, mode: 'insensitive' } } },
          { household: { code: { contains: search, mode: 'insensitive' } } },
        ]
      } : {},
    ]
  }

  const DISB_INCLUDE = {
    person: { select: { id: true, name: true, gender: true } },
    household: { select: { id: true, code: true } },
    medicalCase: { select: { id: true, conditionName: true } },
    approvedBy: { select: { id: true, name: true } },
    createdBy: { select: { id: true, name: true } },
  }

  const [disbursements, total] = await Promise.all([
    prisma.medicalDisbursement.findMany({
      where,
      include: DISB_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.medicalDisbursement.count({ where })
  ])

  return { disbursements, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) }
}

async function findDisbursementsByHousehold(householdId) {
  return prisma.medicalDisbursement.findMany({
    where: { householdId },
    include: {
      person: { select: { id: true, name: true, gender: true, birthDate: true } },
      medicalCase: { select: { id: true, conditionName: true } },
      approvedBy: { select: { id: true, name: true } },
    },
    orderBy: { disbursementDate: 'desc' }
  })
}

async function getLastDisbursementDate(householdId) {
  // الـ cooldown مشترك — نحتاج تاريخ آخر صرف أياً كان النوع
  const last = await prisma.medicalDisbursement.findFirst({
    where: { householdId, status: { not: 'REJECTED' } },
    orderBy: { disbursementDate: 'desc' },
    select: { disbursementDate: true }
  })
  return last?.disbursementDate ?? null
}

async function hasMarriageAidForPerson(personId) {
  const count = await prisma.medicalDisbursement.count({
    where: { personId, aidType: 'MARRIAGE_AID', status: { not: 'REJECTED' } }
  })
  return count > 0
}

async function getPersonAidContext(personId) {
  return prisma.person.findUnique({
    where: { id: personId },
    select: { id: true, isOrphan: true, isBride: true }
  })
}

async function createDisbursement(data) {
  return prisma.medicalDisbursement.create({
    data,
    include: {
      person: { select: { id: true, name: true } },
      medicalCase: { select: { id: true, conditionName: true } },
    }
  })
}

async function updateDisbursementStatus(id, status, approvedById) {
  return prisma.medicalDisbursement.update({
    where: { id },
    data: {
      status,
      approvedById: approvedById ?? undefined,
      approvedAt: status === 'APPROVED' ? new Date() : undefined,
    }
  })
}

// ─── Medical Summary ──────────────────────────────────────

async function getMedicalSummary(householdId) {
  const disbursements = await prisma.medicalDisbursement.findMany({
    where: { householdId, status: { not: 'REJECTED' } },
    select: { aidType: true, amount: true, status: true, disbursementDate: true }
  })

  const counts = {
    consultation: 0, labTest: 0, imaging: 0,
    treatment: 0, surgery: 0, financialAid: 0, marriageAid: 0
  }
  const amounts = {
    consultation: 0, labTest: 0, imaging: 0,
    treatment: 0, surgery: 0, financialAid: 0, marriageAid: 0, total: 0
  }

  const keyMap = {
    CONSULTATION: 'consultation', LAB_TEST: 'labTest', IMAGING: 'imaging',
    TREATMENT: 'treatment', SURGERY: 'surgery',
    FINANCIAL_AID: 'financialAid', MARRIAGE_AID: 'marriageAid'
  }

  for (const d of disbursements) {
    const k = keyMap[d.aidType]
    if (k) {
      counts[k]++
      const amt = Number(d.amount)
      amounts[k] += amt
      amounts.total += amt
    }
  }

  const hasUnverified = disbursements.some(d => d.status === 'PENDING')
  const sorted = disbursements.sort((a, b) => new Date(b.disbursementDate) - new Date(a.disbursementDate))
  const lastDate = sorted[0]?.disbursementDate ?? null

  return { counts, amounts, hasUnverifiedDisbursements: hasUnverified, lastDisbursementDate: lastDate }
}

// ─── KPI Stats ────────────────────────────────────────────

async function getMedicalKpis() {
  const [totalCases, criticalCases, costAgg] = await Promise.all([
    prisma.medicalCase.count(),
    prisma.medicalCase.count({ where: { isCritical: true } }),
    prisma.medicalCase.aggregate({ _sum: { estimatedMonthlyCost: true } }),
  ])
  return {
    totalCases,
    criticalCases,
    monthlyEstimate: Number(costAgg._sum.estimatedMonthlyCost ?? 0)
  }
}

module.exports = {
  findAllCases, findCaseById, findCasesByHousehold,
  createCase, updateCase, deleteCase,
  findAllDisbursements, findDisbursementsByHousehold, getLastDisbursementDate,
  hasMarriageAidForPerson, getPersonAidContext, createDisbursement, updateDisbursementStatus,
  getMedicalSummary, getMedicalKpis,
}
