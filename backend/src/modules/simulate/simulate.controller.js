const simulateService = require('./simulate.service');

module.exports = {
  run: async (req, res, next) => {
    try {
      const data = await simulateService.run(req.user, req.body);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};
