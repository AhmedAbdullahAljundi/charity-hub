const analyticsService = require('./analytics.service');

module.exports = {
  distribution: async (req, res, next) => {
    try {
      res.json({ success: true, data: await analyticsService.distribution() });
    } catch (e) {
      next(e);
    }
  },
  regional: async (req, res, next) => {
    try {
      res.json({ success: true, data: await analyticsService.regional() });
    } catch (e) {
      next(e);
    }
  },
  healthBurden: async (req, res, next) => {
    try {
      res.json({ success: true, data: await analyticsService.healthBurden() });
    } catch (e) {
      next(e);
    }
  },
  scoreTrends: async (req, res, next) => {
    try {
      res.json({ success: true, data: await analyticsService.scoreTrends() });
    } catch (e) {
      next(e);
    }
  },
  verificationStats: async (req, res, next) => {
    try {
      res.json({ success: true, data: await analyticsService.verificationStats() });
    } catch (e) {
      next(e);
    }
  },
  expenseDistribution: async (req, res, next) => {
    try {
      res.json({ success: true, data: await analyticsService.expenseDistribution() });
    } catch (e) {
      next(e);
    }
  },
  financialTrend: async (req, res, next) => {
    try {
      res.json({ success: true, data: await analyticsService.financialTrend() });
    } catch (e) {
      next(e);
    }
  },
};
