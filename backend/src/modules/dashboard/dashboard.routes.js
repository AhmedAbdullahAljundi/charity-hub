/**
 * Dashboard Routes
 */

const express = require('express')
const router = express.Router()
const dashboardController = require('./dashboard.controller')
const { requireAuth } = require('../../middleware/auth')
const { requirePermission } = require('../../middleware/rbac')

router.use(requireAuth)

router.get('/stats', requirePermission('VIEW_SCORING'), dashboardController.getStats)
router.get('/prediction', requirePermission('VIEW_SCORING'), dashboardController.getPrediction)
router.get('/regions-overview', requirePermission('VIEW_SCORING'), dashboardController.getRegionsOverviewHandler)
router.get('/workflow', requirePermission('VIEW_SCORING'), dashboardController.getWorkflow)

module.exports = router
