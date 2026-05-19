const incomeService = require('./income.service');
const { logFieldChanges } = require('../../shared/audit/auditLogger');

const incomeController = {
  create: async (req, res, next) => {
    try {
      const data = await incomeService.create(req.user, req.params.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  update: async (req, res, next) => {
    try {
      const data = await incomeService.update(req.user, req.params.id, req.params.iid, req.body);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  remove: async (req, res, next) => {
    try {
      await incomeService.remove(req.user, req.params.id, req.params.iid);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  },

  verify: async (req, res, next) => {
    try {
      const { before, after } = await incomeService.verify(
        req.user,
        req.params.id,
        req.params.iid,
        req.body
      );
      await logFieldChanges({
        userId: req.user.userId,
        householdId: req.params.id,
        action: 'VERIFY_INCOME',
        entity: 'IncomeSource',
        entityId: after.id,
        changes: [
          {
            fieldName: 'verified',
            before: before.verified,
            after: after.verified,
          },
        ],
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
      res.json({
        success: true,
        data: { ...after, monthlyAmount: after.monthlyAmount.toString() },
      });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = incomeController;
