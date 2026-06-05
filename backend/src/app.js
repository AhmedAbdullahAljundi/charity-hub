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
const { traceIdMiddleware } = require('./middleware/traceId')
const { sanitizeBody } = require('./middleware/sanitize')

const app = express()

// Trace ID middleware
app.use(traceIdMiddleware)

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

// Sanitize body
app.use(sanitizeBody)

// Compression
app.use(compression())

// Health check route
app.get('/api/health', async (req, res) => {
  let dbStatus = 'ok';
  try {
    const prisma = require('./config/prisma');
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'error';
  }

  res.json({
    status: 'CharityHub Backend Running',
    db: dbStatus,
    cache: config.cache.provider,
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.app.env,
  })
})

// Phase 3 API (primary)
app.use('/api', require('./routes/api'))

// Legacy v1 removed

// 404 handler
app.use(notFoundHandler)

// Error handler (must be last)
app.use(errorHandler)

module.exports = app
