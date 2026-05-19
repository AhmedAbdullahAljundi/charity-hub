const verificationService = require('./verification.service');
const { serializeIncomeSource } = require('../../shared/serializers');

module.exports = {
  list: async (req, res, next) => {
    try {
      const rows = await verificationService.list(req.query);
      res.json({
        success: true,
        data: rows.map((r) => ({
          ...serializeIncomeSource(r),
          household: r.household,
        })),
      });
    } catch (e) {
      next(e);
    }
  },

  bulkVerify: async (req, res, next) => {
    try {
      const data = await verificationService.bulkVerify(req.user, req.body);
      res.json({ success: true, data: data.map(serializeIncomeSource) });
    } catch (e) {
      next(e);
    }
  },
};
