const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requirePermission, requireRoles, PERMISSIONS } = require('../../shared/permissions');
const { UserRole } = require('../../shared/constants/enums');
const controller = require('./households.controller');
const personsRoutes = require('../persons/persons.routes');
const incomeRoutes = require('../income/income.routes');
const scoringRoutes = require('../scoring/scoring.routes');
const burdensRoutes = require('./burdens.routes');

const router = express.Router();

router.use(requireAuth);
router.use(requirePermission(PERMISSIONS.HOUSEHOLD_READ));

router.get('/', controller.list);
router.post('/', requirePermission(PERMISSIONS.HOUSEHOLD_WRITE), controller.create);

router.use('/:id/persons', personsRoutes);
router.use('/:id/income', incomeRoutes);
router.use('/:id/burdens', burdensRoutes);
router.use('/:id', scoringRoutes);

router.get('/:id', controller.get);
router.put('/:id', requirePermission(PERMISSIONS.HOUSEHOLD_WRITE), controller.update);
router.delete('/:id', requireRoles(UserRole.ADMIN), controller.remove);
router.patch('/:id/publish', requirePermission(PERMISSIONS.HOUSEHOLD_PUBLISH), controller.publish);

router.get('/:id/notes', controller.getNotes);
router.post('/:id/notes', controller.addNote);
router.post('/:id/request-review', controller.requestReview);

module.exports = router;
