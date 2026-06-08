const svc = require('./medical.service')
const { asyncHandler } = require('../../middleware/errorHandler')

// ─── Cases ────────────────────────────────────────────────

const listCases = asyncHandler(async (req, res) => {
  const result = await svc.listCases(req.query)
  res.json({ success: true, data: result })
})

const getCaseById = asyncHandler(async (req, res) => {
  const c = await svc.getCaseById(req.params.id)
  res.json({ success: true, data: c })
})

const getCasesByHousehold = asyncHandler(async (req, res) => {
  const cases = await svc.getCasesByHousehold(req.params.householdId)
  res.json({ success: true, data: cases })
})

const createCase = asyncHandler(async (req, res) => {
  const c = await svc.createCase(req.body, req.user.userId)
  res.status(201).json({ success: true, data: c })
})

const updateCase = asyncHandler(async (req, res) => {
  const c = await svc.updateCase(req.params.id, req.body)
  res.json({ success: true, data: c })
})

const deleteCase = asyncHandler(async (req, res) => {
  await svc.deleteCase(req.params.id)
  res.json({ success: true, message: 'تم حذف الحالة الطبية' })
})

// ─── Eligibility ──────────────────────────────────────────

const checkEligibility = asyncHandler(async (req, res) => {
  const { householdId } = req.params
  const { aidType, personId } = req.query
  if (!aidType) return res.status(400).json({ success: false, message: 'aidType مطلوب' })
  const result = await svc.getEligibility(householdId, aidType, personId)
  res.json({ success: true, data: result })
})

// ─── Disbursements ────────────────────────────────────────

const createDisbursement = asyncHandler(async (req, res) => {
  const result = await svc.createDisbursement(req.body, req.user.userId)
  const status = result.amountWarning ? 201 : 201
  res.status(status).json({ success: true, data: result })
})

const listDisbursements = asyncHandler(async (req, res) => {
  const data = await svc.listDisbursements(req.query)
  res.json({ success: true, data })
})

const getDisbursementsByHousehold = asyncHandler(async (req, res) => {
  const data = await svc.getDisbursementsByHousehold(req.params.householdId)
  res.json({ success: true, data })
})

const approveDisbursement = asyncHandler(async (req, res) => {
  const d = await svc.approveDisbursement(req.params.id, req.user.userId)
  res.json({ success: true, data: d })
})

const payDisbursement = asyncHandler(async (req, res) => {
  const d = await svc.payDisbursement(req.params.id, req.user.userId)
  res.json({ success: true, data: d })
})

const rejectDisbursement = asyncHandler(async (req, res) => {
  const d = await svc.rejectDisbursement(req.params.id, req.user.userId)
  res.json({ success: true, data: d })
})

// ─── Summary / KPIs ───────────────────────────────────────

const getMedicalSummary = asyncHandler(async (req, res) => {
  const data = await svc.getMedicalSummary(req.params.householdId)
  res.json({ success: true, data })
})

const getMedicalKpis = asyncHandler(async (req, res) => {
  const data = await svc.getMedicalKpis()
  res.json({ success: true, data })
})

module.exports = {
  listCases, getCaseById, getCasesByHousehold,
  createCase, updateCase, deleteCase,
  checkEligibility,
  createDisbursement, listDisbursements, getDisbursementsByHousehold,
  approveDisbursement, payDisbursement, rejectDisbursement,
  getMedicalSummary, getMedicalKpis,
}
