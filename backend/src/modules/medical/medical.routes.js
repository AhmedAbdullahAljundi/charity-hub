/**
 * Medical Records Routes
 */

const express = require('express')
const router = express.Router()
const medicalController = require('./medical.controller')
const { requireAuth } = require('../../middleware/auth')
const { requirePermission } = require('../../middleware/rbac')

// All routes require authentication
router.use(requireAuth)

// Get all medical records for a family
router.get('/family/:familyId', requirePermission('VIEW_SCORING'), medicalController.list)

// Evaluate medical eligibility for a family
router.get('/evaluate/:familyId', requirePermission('APPROVE_MEDICAL'), medicalController.evaluate)

// Get medical record by ID
router.get('/:id', requirePermission('VIEW_SCORING'), medicalController.getById)

// Create medical record - requires CREATE_FAMILY permission
router.post('/member/:memberId', requirePermission('CREATE_FAMILY'), medicalController.create)

// Update medical record - requires UPDATE_FAMILY permission
router.put('/:id', requirePermission('UPDATE_FAMILY'), medicalController.update)

// Delete medical record - requires DELETE_FAMILY permission
router.delete('/:id', requirePermission('DELETE_FAMILY'), medicalController.delete)

module.exports = router
