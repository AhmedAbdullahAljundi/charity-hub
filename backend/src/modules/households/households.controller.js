const householdsService = require('./households.service');
const { householdsRepository } = require('./households.repository');
const { auditContext } = require('../../middleware/auditMiddleware');

const householdsController = {
  list: async (req, res, next) => {
    try {
      const result = await householdsService.list(req.user, req.query, req);
      res.json({ success: true, ...result });
    } catch (e) {
      next(e);
    }
  },

  get: async (req, res, next) => {
    try {
      const data = await householdsService.getById(req.user, req.params.id, req);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  create: async (req, res, next) => {
    try {
      const data = await householdsService.create(req.user, req.body);
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  update: async (req, res, next) => {
    const runAudit = auditContext('Household');
    runAudit(req, res, async (err) => {
      if (err) return next(err);
      try {
        const before = await householdsRepository.findById(req.params.id);
        req.captureAuditBefore(before);
        const data = await householdsService.update(req.user, req.params.id, req.body);
        res.json({ success: true, data });
      } catch (e) {
        next(e);
      }
    });
  },

  remove: async (req, res, next) => {
    try {
      await householdsService.remove(req.user, req.params.id);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  },

  publish: async (req, res, next) => {
    try {
      const data = await householdsService.publish(req.user, req.params.id);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = householdsController;
