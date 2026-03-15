/**
 * Families Routes
 * 
 * Protected routes with authentication and permission checks
 */

const express = require('express')
const router = express.Router()
const familiesController = require('./families.controller')
const { requireAuth } = require('../../middleware/auth')
const { requirePermission } = require('../../middleware/rbac')

// All routes require authentication
router.use(requireAuth)

// Full registration endpoint (Family + related data) - requires CREATE_FAMILY permission
router.post('/register', requirePermission('CREATE_FAMILY'), familiesController.register)

// Get all families - requires VIEW_SCORING permission (or adjust as needed)
router.get('/', requirePermission('VIEW_SCORING'), familiesController.list)

// Get family by ID
router.get('/:id', requirePermission('VIEW_SCORING'), familiesController.getById)

// Create family - requires CREATE_FAMILY permission
router.post('/', requirePermission('CREATE_FAMILY'), familiesController.create)

// Update family - requires UPDATE_FAMILY permission
router.put('/:id', requirePermission('UPDATE_FAMILY'), familiesController.update)

// Delete family - requires DELETE_FAMILY permission
router.delete('/:id', requirePermission('DELETE_FAMILY'), familiesController.delete)

// Get family score - requires VIEW_SCORING permission
router.get('/:id/score', requirePermission('VIEW_SCORING'), familiesController.getScore)

// Persons (Members)
router.post('/:id/persons', requirePermission('UPDATE_FAMILY'), familiesController.addPerson)
router.delete('/persons/:personId', requirePermission('UPDATE_FAMILY'), familiesController.deletePerson)

// Incomes
router.post('/:id/incomes', requirePermission('UPDATE_FAMILY'), familiesController.addIncome)
router.delete('/incomes/:incomeId', requirePermission('UPDATE_FAMILY'), familiesController.deleteIncome)

// Expenses routes (new)
router.post('/:id/expenses', requirePermission('UPDATE_FAMILY'), familiesController.addExpense)
router.delete('/expenses/:expenseId', requirePermission('UPDATE_FAMILY'), familiesController.deleteExpense)

// Medical case routes (new)
router.post('/persons/:personId/medical', requirePermission('UPDATE_FAMILY'), familiesController.addMedicalCase)
router.delete('/medical/:medicalId', requirePermission('UPDATE_FAMILY'), familiesController.deleteMedicalCase)

module.exports = router
