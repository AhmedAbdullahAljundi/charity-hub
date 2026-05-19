const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requirePermission, requireRoles, PERMISSIONS } = require('../../shared/permissions');
const { UserRole } = require('../../shared/constants/enums');
const controller = require('./verification.controller');

const { bulkVerifySchema } = require('../../shared/validators/verification.validator');
const { validate } = require('../../middleware/validate');

const router = express.Router();
router.use(requireAuth);
router.get('/', requirePermission(PERMISSIONS.VERIFICATION_READ), controller.list);
router.patch(
  '/bulk',
  requireRoles(UserRole.ADMIN, UserRole.SUPERVISOR),
  requirePermission(PERMISSIONS.VERIFICATION_BULK),
  validate(bulkVerifySchema),
  controller.bulkVerify
);

module.exports = router;
