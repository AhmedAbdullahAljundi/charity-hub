const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requirePermission, PERMISSIONS } = require('../../shared/permissions');
const controller = require('./analytics.controller');

const router = express.Router();
router.use(requireAuth);
router.use(requirePermission(PERMISSIONS.ANALYTICS_READ));

router.get('/distribution', controller.distribution);
router.get('/regional', controller.regional);
router.get('/health-burden', controller.healthBurden);
router.get('/score-trends', controller.scoreTrends);
router.get('/verification-stats', controller.verificationStats);

module.exports = router;
