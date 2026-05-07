/**
 * Environment Configuration
 * 
 * Loads and validates environment variables
 */

require('dotenv').config()

const config = {
  // App
  app: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
  },

  // Database
  database: {
    url: process.env.DATABASE_URL,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET,
    accessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Scoring
  scoring: {
    baselineCoefficient: parseFloat(process.env.BASELINE_COEFFICIENT || '1.0'),
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Audit
  audit: {
    enabled: process.env.AUDIT_ENABLED === 'true',
  },


}

// Validate required environment variables
const requiredVars = ['DATABASE_URL']
const missingVars = requiredVars.filter((varName) => !process.env[varName])

if (missingVars.length > 0) {
  console.warn('⚠️  Missing required environment variables:')
  missingVars.forEach((varName) => console.warn(`   - ${varName}`))
  console.warn('\n⚠️  Server will start but database features will not work')
  console.warn('Please check your .env file and set DATABASE_URL')
  // Don't exit - allow server to start for testing
}

module.exports = config
