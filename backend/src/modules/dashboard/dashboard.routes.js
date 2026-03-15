/**
 * Dashboard Routes
 */

const express = require('express')
const router = express.Router()
const dashboardController = require('./dashboard.controller')
const { requireAuth } = require('../../middleware/auth')
const { requirePermission } = require('../../middleware/rbac')

router.use(requireAuth)

// GET /api/v1/dashboard/stats
router.get('/stats', requirePermission('VIEW_SCORING'), dashboardController.getStats)

module.exports = router
