const express = require('express');
const { requirePermission, requireRoles, PERMISSIONS } = require('../../shared/permissions');
const { UserRole } = require('../../shared/constants/enums');
const controller = require('./income.controller');

const router = express.Router({ mergeParams: true });

router.post('/', requirePermission(PERMISSIONS.INCOME_WRITE), controller.create);
router.put('/:iid', requirePermission(PERMISSIONS.INCOME_WRITE), controller.update);
router.delete('/:iid', requirePermission(PERMISSIONS.INCOME_WRITE), controller.remove);
router.patch(
  '/:iid/verify',
  requireRoles(UserRole.ADMIN, UserRole.SUPERVISOR),
  requirePermission(PERMISSIONS.INCOME_VERIFY),
  controller.verify
);

module.exports = router;
