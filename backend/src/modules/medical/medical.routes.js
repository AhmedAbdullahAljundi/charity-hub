const router = require('express').Router()
const ctrl = require('./medical.controller')
const { requireAuth } = require('../../middleware/auth')
const { requireAnyRole } = require('../../middleware/rbac')

// كل الـ routes تحتاج auth
router.use(requireAuth)

// ─── Medical Cases ────────────────────────────────────────
// GET  /api/medical-cases
router.get('/', ctrl.listCases)

// GET  /api/medical-cases/kpis
router.get('/kpis', ctrl.getMedicalKpis)

// GET  /api/medical-cases/household/:householdId
router.get('/household/:householdId', ctrl.getCasesByHousehold)

// POST /api/medical-cases
router.post('/', requireAnyRole(['WORKER', 'SUPERVISOR', 'ADMIN']), ctrl.createCase)

// GET  /api/medical-cases/:id
router.get('/:id', ctrl.getCaseById)

// PUT  /api/medical-cases/:id
router.put('/:id', requireAnyRole(['WORKER', 'SUPERVISOR', 'ADMIN']), ctrl.updateCase)

// DELETE /api/medical-cases/:id
router.delete('/:id', requireAnyRole(['ADMIN']), ctrl.deleteCase)

// ─── Eligibility Check ────────────────────────────────────
// GET  /api/medical-cases/eligibility/:householdId?aidType=TREATMENT&personId=xxx
router.get('/eligibility/:householdId', ctrl.checkEligibility)

// GET  /api/medical-cases/summary/:householdId
router.get('/summary/:householdId', ctrl.getMedicalSummary)

module.exports = router
