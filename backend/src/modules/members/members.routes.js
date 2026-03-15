/**
 * Members Routes
 */

const express = require('express')
const router = express.Router()
const membersController = require('./members.controller')
const { requireAuth } = require('../../middleware/auth')
const { requirePermission } = require('../../middleware/rbac')

// All routes require authentication
router.use(requireAuth)

// Get all members for a family
router.get('/family/:familyId', requirePermission('VIEW_SCORING'), membersController.list)

// Get member by ID
router.get('/:id', requirePermission('VIEW_SCORING'), membersController.getById)

// Create member - requires CREATE_FAMILY permission
router.post('/family/:familyId', requirePermission('CREATE_FAMILY'), membersController.create)

// Update member - requires UPDATE_FAMILY permission
router.put('/:id', requirePermission('UPDATE_FAMILY'), membersController.update)

// Delete member - requires DELETE_FAMILY permission
router.delete('/:id', requirePermission('DELETE_FAMILY'), membersController.delete)

module.exports = router
