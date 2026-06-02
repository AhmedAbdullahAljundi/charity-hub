const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requirePermission, requireRoles, PERMISSIONS } = require('../../shared/permissions');
const { UserRole } = require('../../shared/constants/enums');
const controller = require('./education.controller');

const router = express.Router();

router.use(requireAuth);
router.use(requirePermission(PERMISSIONS.EDUCATION_READ));

router.get('/household-lookup', controller.householdLookup);
router.get('/kpis', controller.getKpis);
router.get('/person/:personId/history', controller.getPersonHistory);
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', requirePermission(PERMISSIONS.EDUCATION_WRITE), controller.create);
router.put('/:id', requirePermission(PERMISSIONS.EDUCATION_WRITE), controller.update);
router.delete('/:id', requireRoles(UserRole.ADMIN), controller.remove);

module.exports = router;
