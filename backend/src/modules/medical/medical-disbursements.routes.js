const router = require('express').Router()
const ctrl = require('./medical.controller')
const { requireAuth } = require('../../middleware/auth')
const { requireAnyRole } = require('../../middleware/rbac')

router.use(requireAuth)

// POST /api/medical-disbursements
router.post('/', requireAnyRole(['WORKER', 'SUPERVISOR', 'ADMIN']), ctrl.createDisbursement)

// GET  /api/medical-disbursements/household/:householdId
router.get('/household/:householdId', ctrl.getDisbursementsByHousehold)

// PATCH /api/medical-disbursements/:id/approve
router.patch('/:id/approve', requireAnyRole(['SUPERVISOR', 'ADMIN']), ctrl.approveDisbursement)

// PATCH /api/medical-disbursements/:id/pay
router.patch('/:id/pay', requireAnyRole(['SUPERVISOR', 'ADMIN']), ctrl.payDisbursement)

// PATCH /api/medical-disbursements/:id/reject
router.patch('/:id/reject', requireAnyRole(['SUPERVISOR', 'ADMIN']), ctrl.rejectDisbursement)

module.exports = router
