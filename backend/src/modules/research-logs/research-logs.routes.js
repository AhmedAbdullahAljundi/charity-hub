/**
 * Research Logs Routes
 *
 * API routes for research log management
 */

const express = require('express')
const router = express.Router()
const controller = require('./research-logs.controller')
const { requireAuth } = require('../../middleware/auth')

// All routes require authentication
router.use(requireAuth)

router.get('/', controller.list)
router.get('/:id', controller.getById)
router.post('/', controller.create)
router.put('/:id', controller.update)
router.delete('/:id', controller.delete)

module.exports = router
