/**
 * Simulations Routes
 *
 * API routes for simulation management
 */

const express = require('express')
const router = express.Router()
const controller = require('./simulations.controller')
const { requireAuth } = require('../../middleware/auth')

// All routes require authentication
router.use(requireAuth)

router.get('/', controller.list)
router.get('/:id', controller.getById)
router.post('/', controller.create)
router.delete('/:id', controller.delete)

module.exports = router
