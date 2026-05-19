const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requireRoles } = require('../../shared/permissions');
const { UserRole } = require('../../shared/constants/enums');
const controller = require('./admin.controller');

const { overrideRuleSchema, simulateRuleSchema } = require('../../shared/validators/admin.validator');
const { validate } = require('../../middleware/validate');

const router = express.Router();
router.use(requireAuth);
router.use(requireRoles(UserRole.ADMIN));

router.get('/rules', controller.listRules);
router.put('/rules/:ruleId', validate(overrideRuleSchema), controller.upsertRule);
router.delete('/rules/:ruleId/override', controller.revertRule);
router.post('/rules/:ruleId/simulate', validate(simulateRuleSchema), controller.simulateRule);

module.exports = router;
