const burdensService = require('./burdens.service');

const burdensController = {
  create: async (req, res, next) => {
    try {
      const data = await burdensService.create(req.user, req.params.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  update: async (req, res, next) => {
    try {
      const data = await burdensService.update(req.user, req.params.id, req.params.bid, req.body);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  remove: async (req, res, next) => {
    try {
      await burdensService.remove(req.user, req.params.id, req.params.bid);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = burdensController;
