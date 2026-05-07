/**
 * API v1 Routes
 * 
 * Main API router
 */

const express = require('express')
const router = express.Router()

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'CharityHub Backend Running',
    timestamp: new Date().toISOString(),
  })
})

// Authentication routes (public)
router.use('/auth', require('../modules/auth/auth.routes'))

// Protected routes
router.use('/families', require('../modules/families/families.routes'))
router.use('/dashboard', require('../modules/dashboard/dashboard.routes'))
router.use('/scoring', require('../modules/scoring/scoring.routes'))
router.use('/members', require('../modules/members/members.routes'))
router.use('/income', require('../modules/income/income.routes'))
router.use('/expenses', require('../modules/expenses/expenses.routes'))
router.use('/medical', require('../modules/medical/medical.routes'))

module.exports = router
