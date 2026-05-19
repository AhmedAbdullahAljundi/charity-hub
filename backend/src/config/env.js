/**
 * Environment configuration
 */

require('dotenv').config();

const config = {
  app: {
    port: parseInt(process.env.PORT || '5000', 10),
    env: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'dev-access-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev-refresh-secret-change-me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: 'charityhub-targeting',
    audience: 'charityhub-api',
  },
  cache: {
    provider: process.env.CACHE_PROVIDER || 'memory',
    redisUrl: process.env.REDIS_URL || null,
    rulesTtlSeconds: parseInt(process.env.CACHE_RULES_TTL || '300', 10),
    analyticsTtlSeconds: parseInt(process.env.CACHE_ANALYTICS_TTL || '900', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  auth: {
    requireAuth: process.env.REQUIRE_AUTH !== 'false',
  },
  api: {
    enableLegacyV1: process.env.ENABLE_LEGACY_API === 'true',
  },
  scoring: {
    engineVersion: process.env.SCORING_ENGINE_VERSION || '2.0.0',
    ruleVersion: process.env.SCORING_RULE_VERSION || '2024-01',
  },
};

if (config.app.env === 'production') {
  if (
    !process.env.JWT_ACCESS_SECRET ||
    !process.env.JWT_REFRESH_SECRET ||
    config.jwt.accessSecret === 'dev-access-secret-change-me'
  ) {
    throw new Error('CRITICAL: JWT secrets must be set in production environment!');
  }
}

module.exports = config;
