const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requirePermission, PERMISSIONS } = require('../../shared/permissions');
const controller = require('./simulate.controller');

const { simulateSchema } = require('../../shared/validators/simulate.validator');
const { validate } = require('../../middleware/validate');

const router = express.Router();
router.use(requireAuth);
router.post('/', requirePermission(PERMISSIONS.SIMULATE), validate(simulateSchema), controller.run);

module.exports = router;
