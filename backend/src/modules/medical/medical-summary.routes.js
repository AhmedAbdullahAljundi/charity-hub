const router = require('express').Router()
const ctrl = require('./medical.controller')
const { requireAuth } = require('../../middleware/auth')

router.use(requireAuth)

// GET /api/households/:householdId/medical-summary
router.get('/:householdId/medical-summary', ctrl.getMedicalSummary)

module.exports = router
