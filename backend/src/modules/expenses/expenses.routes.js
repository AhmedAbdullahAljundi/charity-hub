/**
 * Expenses Routes
 */

const express = require('express')
const router = express.Router()
const expensesController = require('./expenses.controller')
const { requireAuth } = require('../../middleware/auth')
const { requirePermission } = require('../../middleware/rbac')

// All routes require authentication
router.use(requireAuth)

// Get all expenses for a family
router.get('/family/:familyId', requirePermission('VIEW_SCORING'), expensesController.list)

// Get expense by ID
router.get('/:id', requirePermission('VIEW_SCORING'), expensesController.getById)

// Create expense - requires CREATE_FAMILY permission
router.post('/family/:familyId', requirePermission('CREATE_FAMILY'), expensesController.create)

// Update expense - requires UPDATE_FAMILY permission
router.put('/:id', requirePermission('UPDATE_FAMILY'), expensesController.update)

// Delete expense - requires DELETE_FAMILY permission
router.delete('/:id', requirePermission('DELETE_FAMILY'), expensesController.delete)

module.exports = router
