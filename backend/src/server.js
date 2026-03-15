/**
 * Server Entry Point
 * 
 * Starts the Express server
 */

const app = require('./app')
const config = require('./config/env')
const prisma = require('./config/prisma')

const server = app.listen(config.app.port, () => {
  console.log(`
🚀 CharityHub Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Port: ${config.app.port}
🌍 Environment: ${config.app.env}
🔗 URL: ${config.app.baseUrl}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `)
})

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`)
  
  server.close(async () => {
    console.log('HTTP server closed')
    
    try {
      await prisma.$disconnect()
      console.log('Database connection closed')
      process.exit(0)
    } catch (error) {
      console.error('Error during shutdown:', error)
      process.exit(1)
    }
  })
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err)
  gracefulShutdown('UNHANDLED_REJECTION')
})
