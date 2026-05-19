const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requirePermission, PERMISSIONS } = require('../../shared/permissions');
const controller = require('./audit.controller');

const router = express.Router();
router.use(requireAuth);
router.use(requirePermission(PERMISSIONS.AUDIT_READ));
router.get('/', controller.list);

module.exports = router;
