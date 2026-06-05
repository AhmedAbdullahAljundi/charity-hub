const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requirePermission } = require('../../shared/permissions');
const { PERMISSIONS } = require('../../shared/permissions');
const usersController = require('./users.controller');

const router = express.Router();

// All routes require auth + USER_READ minimum
router.use(requireAuth);

router.get('/',    requirePermission(PERMISSIONS.USER_READ),   usersController.list);
router.get('/:id', requirePermission(PERMISSIONS.USER_READ),   usersController.getOne);
router.post('/',   requirePermission(PERMISSIONS.USER_WRITE),  usersController.create);
router.put('/:id', requirePermission(PERMISSIONS.USER_WRITE),  usersController.update);
router.delete('/:id', requirePermission(PERMISSIONS.USER_DELETE), usersController.remove);

// Role + permissions + password management
router.patch('/:id/role',           requirePermission(PERMISSIONS.USER_WRITE), usersController.changeRole);
router.patch('/:id/permissions',    requirePermission(PERMISSIONS.USER_WRITE), usersController.setPermissions);
router.patch('/:id/set-temp-password', requirePermission(PERMISSIONS.USER_WRITE), usersController.setTempPassword);

module.exports = router;
