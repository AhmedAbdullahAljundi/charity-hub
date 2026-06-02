/**
 * Phase 3 API router — /api/*
 */

const express = require('express');
const { optionalAttachUser } = require('../middleware/auth');
const { getApiLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.use(optionalAttachUser);
router.use(getApiLimiter);

router.use('/auth', require('./../modules/auth/auth.routes'));
router.use('/households', require('../modules/households/households.routes'));
router.use('/simulate', require('../modules/simulate/simulate.routes'));
router.use('/admin', require('../modules/admin/admin.routes'));
router.use('/analytics', require('../modules/analytics/analytics.routes'));
router.use('/audit-logs', require('../modules/audit/audit.routes'));
router.use('/verification', require('../modules/verification/verification.routes'));
router.use('/education', require('../modules/education/education.routes'));

module.exports = router;
