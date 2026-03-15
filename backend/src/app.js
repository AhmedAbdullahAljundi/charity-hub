/**
 * Express App Configuration
 * 
 * Main application setup with middleware
 */

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const config = require('./config/env')
const { errorHandler } = require('./middleware/errorHandler')
const { notFoundHandler } = require('./middleware/notFoundHandler')

const app = express()

// Security middleware
app.use(helmet())

// CORS configuration
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Compression
app.use(compression())

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'CharityHub Backend Running',
    timestamp: new Date().toISOString(),
    environment: config.app.env,
  })
})

// API routes
app.use('/api/v1', require('./routes/api.v1'))

// 404 handler
app.use(notFoundHandler)

// Error handler (must be last)
app.use(errorHandler)

module.exports = app
