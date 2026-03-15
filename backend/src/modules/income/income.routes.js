/**
 * Income Sources Routes
 */

const express = require('express')
const router = express.Router()
const incomeController = require('./income.controller')
const { requireAuth } = require('../../middleware/auth')
const { requirePermission } = require('../../middleware/rbac')

// All routes require authentication
router.use(requireAuth)

// Get all income sources for a family
router.get('/family/:familyId', requirePermission('VIEW_SCORING'), incomeController.list)

// Get income source by ID
router.get('/:id', requirePermission('VIEW_SCORING'), incomeController.getById)

// Create income source - requires CREATE_FAMILY permission
router.post('/family/:familyId', requirePermission('CREATE_FAMILY'), incomeController.create)

// Update income source - requires UPDATE_FAMILY permission
router.put('/:id', requirePermission('UPDATE_FAMILY'), incomeController.update)

// Delete income source - requires DELETE_FAMILY permission
router.delete('/:id', requirePermission('DELETE_FAMILY'), incomeController.delete)

module.exports = router
