/**
 * Physics Models Routes
 *
 * API routes for physics model management
 */

const express = require('express')
const router = express.Router()
const controller = require('./physics-models.controller')
const { requireAuth } = require('../../middleware/auth')

// All routes require authentication
router.use(requireAuth)

router.get('/', controller.list)
router.get('/:id', controller.getById)
router.post('/', controller.create)
router.put('/:id', controller.update)
router.delete('/:id', controller.delete)

module.exports = router
