const express = require('express');
const { requirePermission, requireRoles, PERMISSIONS } = require('../../shared/permissions');
const { UserRole } = require('../../shared/constants/enums');
const { calculateLimiter } = require('../../middleware/rateLimit');
const controller = require('./scoring.controller');

const router = express.Router({ mergeParams: true });

router.post(
  '/calculate',
  calculateLimiter,
  requirePermission(PERMISSIONS.SCORE_CALCULATE),
  controller.calculate
);
router.get('/score-history', requirePermission(PERMISSIONS.SCORE_READ), controller.history);
router.get('/score-latest', requirePermission(PERMISSIONS.SCORE_READ), controller.latest);
router.patch(
  '/score-latest/decide',
  requireRoles(UserRole.ADMIN, UserRole.SUPERVISOR),
  requirePermission(PERMISSIONS.SCORE_DECIDE),
  controller.decide
);

module.exports = router;
