const express = require('express');
const { requirePermission, PERMISSIONS } = require('../../shared/permissions');
const controller = require('./burdens.controller');

const router = express.Router({ mergeParams: true });

router.post('/', requirePermission(PERMISSIONS.HOUSEHOLD_WRITE), controller.create);
router.put('/:bid', requirePermission(PERMISSIONS.HOUSEHOLD_WRITE), controller.update);
router.delete('/:bid', requirePermission(PERMISSIONS.HOUSEHOLD_WRITE), controller.remove);

module.exports = router;
