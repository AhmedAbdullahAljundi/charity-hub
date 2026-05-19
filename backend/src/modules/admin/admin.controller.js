const adminService = require('./admin.service');

module.exports = {
  listRules: async (req, res, next) => {
    try {
      const data = await adminService.listRules();
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  upsertRule: async (req, res, next) => {
    try {
      req.auditAction = 'RULE_OVERRIDE';
      const data = await adminService.upsertOverride(req.user, req.params.ruleId, req.body);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  revertRule: async (req, res, next) => {
    try {
      const data = await adminService.revertOverride(req.user, req.params.ruleId);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  simulateRule: async (req, res, next) => {
    try {
      const data = await adminService.simulateRuleImpact(req.params.ruleId);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};
