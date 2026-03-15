/**
 * Scoring Routes
 * 
 * Protected routes with authentication and permission checks
 */

const express = require('express')
const router = express.Router()
const scoringController = require('./scoring.controller')
const { requireAuth } = require('../../middleware/auth')
const { requirePermission } = require('../../middleware/rbac')

// All routes require authentication
router.use(requireAuth)

// Calculate score for family - requires VIEW_SCORING permission
router.get('/:familyId', requirePermission('VIEW_SCORING'), scoringController.calculate)

// Recalculate and SAVE score - requires VIEW_SCORING permission
router.post('/:familyId/recalculate', requirePermission('VIEW_SCORING'), scoringController.recalculate)

module.exports = router
