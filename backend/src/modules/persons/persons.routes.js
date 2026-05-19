const express = require('express');
const { requirePermission, PERMISSIONS } = require('../../shared/permissions');
const controller = require('./persons.controller');

const router = express.Router({ mergeParams: true });

router.post('/', requirePermission(PERMISSIONS.HOUSEHOLD_WRITE), controller.create);
router.put('/:pid', requirePermission(PERMISSIONS.HOUSEHOLD_WRITE), controller.update);
router.delete('/:pid', requirePermission(PERMISSIONS.HOUSEHOLD_WRITE), controller.remove);

router.post('/:pid/diseases', requirePermission(PERMISSIONS.HOUSEHOLD_WRITE), controller.createDisease);
router.put('/:pid/diseases/:did', requirePermission(PERMISSIONS.HOUSEHOLD_WRITE), controller.updateDisease);
router.delete('/:pid/diseases/:did', requirePermission(PERMISSIONS.HOUSEHOLD_WRITE), controller.removeDisease);

router.post('/:pid/disabilities', requirePermission(PERMISSIONS.HOUSEHOLD_WRITE), controller.createDisability);
router.put('/:pid/disabilities/:diid', requirePermission(PERMISSIONS.HOUSEHOLD_WRITE), controller.updateDisability);
router.delete('/:pid/disabilities/:diid', requirePermission(PERMISSIONS.HOUSEHOLD_WRITE), controller.removeDisability);

module.exports = router;
