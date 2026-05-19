const auditService = require('./audit.service');

module.exports = {
  list: async (req, res, next) => {
    try {
      const result = await auditService.list(req.query);
      res.json({ success: true, ...result });
    } catch (e) {
      next(e);
    }
  },
};
