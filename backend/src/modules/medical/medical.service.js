const repo = require('./medical.repository')
const { checkEligibility, validateAmount } = require('./medical-eligibility')
const { AppError } = require('../../shared/errors')

// ─── Cases ────────────────────────────────────────────────

async function listCases(query) {
  const { search, aidType, criticalOnly, isActive, page, limit } = query
  return repo.findAllCases({
    search,
    aidType,
    criticalOnly: criticalOnly === 'true',
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
  })
}

async function getCaseById(id) {
  const c = await repo.findCaseById(id)
  if (!c) throw new AppError('الحالة الطبية غير موجودة', 404)
  return c
}

async function getCasesByHousehold(householdId) {
  return repo.findCasesByHousehold(householdId)
}

async function createCase(data, userId) {
  return repo.createCase({ ...data, createdById: userId })
}

async function updateCase(id, data) {
  await getCaseById(id)
  return repo.updateCase(id, data)
}

async function deleteCase(id) {
  await getCaseById(id)
  return repo.deleteCase(id)
}

// ─── Eligibility Check ────────────────────────────────────

async function getEligibility(householdId, aidType, personId) {
  // جلب تصنيف الأسرة من آخر ScoreResult
  const prisma = require('../../config/prisma')

  const lastScore = await prisma.scoreResult.findFirst({
    where: { householdId },
    orderBy: { calculatedAt: 'desc' },
    select: { assistanceType: true, normalizedPercent: true }
  })
  const assistanceType = lastScore?.assistanceType ?? 'NONE'

  // آخر تاريخ صرف (مشترك لكل الأنواع)
  const lastDate = await repo.getLastDisbursementDate(householdId)

  // للزواج: هل سبق صرفها
  const hasPreviousMarriage = personId && aidType === 'MARRIAGE_AID'
    ? await repo.hasMarriageAidForPerson(personId)
    : false
  const personAidContext = personId ? await repo.getPersonAidContext(personId) : null

  const isCritical = false // يُحدَّد من بيانات الحالة، مش من هنا

  const result = checkEligibility({
    assistanceType,
    lastDisbursementDate: lastDate,
    aidType,
    isCritical,
    hasPreviousMarriageAid: hasPreviousMarriage,
    isOrphan: Boolean(personAidContext?.isOrphan),
    normalizedPercent: lastScore?.normalizedPercent ?? null,
  })

  return {
    ...result,
    assistanceType,
    lastDisbursementDate: lastDate,
    normalizedPercent: lastScore?.normalizedPercent ?? null,
  }
}

// ─── Disbursements ────────────────────────────────────────

async function createDisbursement(data, userId) {
  const { householdId, personId, aidType, amount, isCritical, medicalCaseId } = data

  // جلب تصنيف الأسرة
  const prisma = require('../../config/prisma')

  const lastScore = await prisma.scoreResult.findFirst({
    where: { householdId },
    orderBy: { calculatedAt: 'desc' },
    select: { assistanceType: true, normalizedPercent: true }
  })
  const assistanceType = lastScore?.assistanceType ?? 'NONE'

  const lastDate = await repo.getLastDisbursementDate(householdId)
  const hasPreviousMarriage = aidType === 'MARRIAGE_AID'
    ? await repo.hasMarriageAidForPerson(personId)
    : false
  const personAidContext = await repo.getPersonAidContext(personId)

  const eligibility = checkEligibility({
    assistanceType,
    lastDisbursementDate: lastDate,
    aidType,
    isCritical: isCritical ?? false,
    hasPreviousMarriageAid: hasPreviousMarriage,
    isOrphan: Boolean(personAidContext?.isOrphan),
    normalizedPercent: lastScore?.normalizedPercent ?? null,
    amount,
    totalCost: data.totalCost,
  })

  // فحص المبلغ (تحذير فقط — لا نمنع الحفظ)
  const amountCheck = validateAmount(Number(amount), eligibility)
  const warnings = [eligibility.percentageWarning, amountCheck.warning].filter(Boolean)

  // تحديد الـ status الابتدائي
  // العملية دائماً PENDING (تحتاج مشرف)
  // الحالات الأخرى: لو eligibility.warningLevel !== 'OK' → PENDING أيضاً لكن بنحفظ
  const requiresSupervisorReview =
    Boolean(isCritical) ||
    aidType === 'SURGERY' ||
    eligibility.warningLevel === 'BLOCKED' ||
    Boolean(eligibility.nextEligibleDate) ||
    Boolean(amountCheck.warning)
  const initialStatus = requiresSupervisorReview ? 'PENDING' : 'APPROVED'

  const disbursement = await repo.createDisbursement({
    householdId,
    personId,
    medicalCaseId: medicalCaseId ?? null,
    aidType,
    amount,
    totalCost: data.totalCost ?? null,
    coveragePercent: data.coveragePercent ?? null,
    isCriticalOverride: eligibility.isCriticalOverride ?? false,
    isRetroactive: data.isRetroactive ?? false,
    disbursementDate: data.disbursementDate ? new Date(data.disbursementDate) : new Date(),
    status: initialStatus,
    notes: data.notes ?? null,
    createdById: userId,
  })

  // AuditLog
  try {
    const { auditLogger } = require('../../shared/audit/auditLogger')
    await auditLogger.log({
      userId,
      householdId,
      action: 'CREATE',
      entity: 'MedicalDisbursement',
      entityId: disbursement.id,
      after: { aidType, amount, status: initialStatus, warnings },
    })
  } catch (_) {}

  return {
    disbursement,
    eligibilityResult: eligibility,
    amountWarning: warnings.length ? warnings.join(' ') : null,
  }
}

async function approveDisbursement(id, approverId) {
  const prisma = require('../../config/prisma')
  const d = await prisma.medicalDisbursement.findUnique({ where: { id } })
  if (!d) throw new AppError('الصرف غير موجود', 404)
  if (d.status !== 'PENDING') throw new AppError('هذا الصرف ليس في حالة انتظار', 400)
  return repo.updateDisbursementStatus(id, 'APPROVED', approverId)
}

async function payDisbursement(id, approverId) {
  return repo.updateDisbursementStatus(id, 'PAID', approverId)
}

async function rejectDisbursement(id, approverId) {
  return repo.updateDisbursementStatus(id, 'REJECTED', approverId)
}

async function listDisbursements(query = {}) {
  return repo.findAllDisbursements(query)
}

async function getDisbursementsByHousehold(householdId) {
  return repo.findDisbursementsByHousehold(householdId)
}

async function getMedicalSummary(householdId) {
  return repo.getMedicalSummary(householdId)
}

async function getMedicalKpis() {
  return repo.getMedicalKpis()
}

module.exports = {
  listCases, getCaseById, getCasesByHousehold,
  createCase, updateCase, deleteCase,
  getEligibility,
  createDisbursement, listDisbursements, approveDisbursement, payDisbursement,
  rejectDisbursement, getDisbursementsByHousehold,
  getMedicalSummary, getMedicalKpis,
}
