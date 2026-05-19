const scoringService = require('./scoring.service');

const scoringController = {
  calculate: async (req, res, next) => {
    try {
      const data = await scoringService.calculate(req.user, req.params.id);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  history: async (req, res, next) => {
    try {
      const data = await scoringService.getHistory(req.user, req.params.id);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  latest: async (req, res, next) => {
    try {
      const data = await scoringService.getLatest(req.user, req.params.id);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  decide: async (req, res, next) => {
    try {
      const data = await scoringService.decide(req.user, req.params.id, req.body);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = scoringController;
