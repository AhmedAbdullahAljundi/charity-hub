/**
 * Authentication Routes
 * 
 * API routes for authentication
 */

const express = require('express')
const router = express.Router()
const authController = require('./auth.controller')
const { requireAuth } = require('../../middleware/auth')

// Public routes
router.post('/login', authController.login)
router.post('/logout', authController.logout)

// Protected routes
router.get('/me', requireAuth, authController.getMe)

module.exports = router
