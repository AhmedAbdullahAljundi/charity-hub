const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requirePermission, PERMISSIONS } = require('../../shared/permissions');
const controller = require('./analytics.controller');
const importController = require('./import.controller');
const exportController = require('./export.controller');
const upload = require('../../shared/middleware/upload');

const router = express.Router();
router.use(requireAuth);
router.use(requirePermission(PERMISSIONS.ANALYTICS_READ));

router.get('/distribution', controller.distribution);
router.get('/regional', controller.regional);
router.get('/health-burden', controller.healthBurden);
router.get('/score-trends', controller.scoreTrends);
router.get('/verification-stats', controller.verificationStats);
router.get('/expense-distribution', controller.expenseDistribution);
router.get('/financial-trend', controller.financialTrend);

// Export feature
router.get('/export/:type', exportController.downloadPreset);
router.post('/export/custom', exportController.downloadCustom);

// Import feature is placed under analytics to keep it in the same module
router.post('/import/households', upload.single('file'), importController.importExcel);

module.exports = router;
