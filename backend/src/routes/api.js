/**
 * Phase 3 API router — /api/*
 */

const express = require('express');
const { optionalAttachUser } = require('../middleware/auth');
const { getApiLimiter } = require('../middleware/rateLimit');
const medicalCasesRouter = require('../modules/medical/medical.routes')
const medicalDisbursementsRouter = require('../modules/medical/medical-disbursements.routes')
const medicalSummaryRouter = require('../modules/medical/medical-summary.routes')
const disbursementRouter = require('../modules/disbursement/disbursement.routes')

const router = express.Router();

router.use(optionalAttachUser);
router.use(getApiLimiter);

router.use('/auth',         require('../modules/auth/auth.routes'));
router.use('/households',   require('../modules/households/households.routes'));
router.use('/simulate',     require('../modules/simulate/simulate.routes'));
router.use('/admin',        require('../modules/admin/admin.routes'));
router.use('/analytics',    require('../modules/analytics/analytics.routes'));
router.use('/audit-logs',   require('../modules/audit/audit.routes'));
router.use('/verification', require('../modules/verification/verification.routes'));
router.use('/education',    require('../modules/education/education.routes'));
router.use('/users',        require('../modules/users/users.routes'));
router.use('/notifications', require('../modules/notifications/notifications.routes'));
router.use('/public',       require('../modules/public/public.routes'));
router.use('/medical-cases', medicalCasesRouter)
router.use('/medical-disbursements', medicalDisbursementsRouter)
router.use('/households', medicalSummaryRouter)
router.use('/disbursement', disbursementRouter)

module.exports = router;

