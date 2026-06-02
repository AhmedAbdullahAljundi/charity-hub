const educationService = require('./education.service');

const educationController = {
  list: async (req, res, next) => {
    try {
      const result = await educationService.list(req.query);
      res.json({ success: true, ...result });
    } catch (e) {
      next(e);
    }
  },

  householdLookup: async (req, res, next) => {
    try {
      const data = await educationService.householdLookup(req.query);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  getKpis: async (req, res, next) => {
    try {
      const data = await educationService.getKpis(req.query);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  getById: async (req, res, next) => {
    try {
      const data = await educationService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  create: async (req, res, next) => {
    try {
      const data = await educationService.create(req.body, req.user);
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  update: async (req, res, next) => {
    try {
      const data = await educationService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  remove: async (req, res, next) => {
    try {
      await educationService.remove(req.params.id);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  },

  getPersonHistory: async (req, res, next) => {
    try {
      const data = await educationService.getPersonHistory(req.params.personId);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = educationController;
