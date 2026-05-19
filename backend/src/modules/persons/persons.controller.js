const personsService = require('./persons.service');
const prisma = require('../../config/prisma');
const { auditContext } = require('../../middleware/auditMiddleware');

function wrapAudit(handler, entity, idParam) {
  return async (req, res, next) => {
    const runAudit = auditContext(entity, (r) => r.params[idParam], (r) => r.params.id);
    runAudit(req, res, async (err) => {
      if (err) return next(err);
      try {
        if (['PUT', 'PATCH'].includes(req.method)) {
          const before = await loadBefore(req, entity, idParam);
          if (before) req.captureAuditBefore(before);
        }
        await handler(req, res, next);
      } catch (e) {
        next(e);
      }
    });
  };
}

async function loadBefore(req, entity, idParam) {
  const id = req.params[idParam];
  if (entity === 'Person') {
    return prisma.person.findUnique({
      where: { id },
      include: { diseases: true, disabilities: true },
    });
  }
  if (entity === 'Disease') return prisma.disease.findUnique({ where: { id } });
  if (entity === 'Disability') return prisma.disability.findUnique({ where: { id } });
  return null;
}

const personsController = {
  create: async (req, res, next) => {
    try {
      const data = await personsService.create(req.user, req.params.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  update: wrapAudit(async (req, res) => {
    const data = await personsService.update(req.user, req.params.id, req.params.pid, req.body);
    res.json({ success: true, data });
  }, 'Person', 'pid'),

  remove: async (req, res, next) => {
    try {
      await personsService.remove(req.user, req.params.id, req.params.pid);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  },

  createDisease: async (req, res, next) => {
    try {
      const data = await personsService.createDisease(req.user, req.params.id, req.params.pid, req.body);
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  updateDisease: wrapAudit(async (req, res) => {
    const data = await personsService.updateDisease(
      req.user,
      req.params.id,
      req.params.pid,
      req.params.did,
      req.body
    );
    res.json({ success: true, data });
  }, 'Disease', 'did'),

  removeDisease: async (req, res, next) => {
    try {
      await personsService.removeDisease(req.user, req.params.id, req.params.pid, req.params.did);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  },

  createDisability: async (req, res, next) => {
    try {
      const data = await personsService.createDisability(
        req.user,
        req.params.id,
        req.params.pid,
        req.body
      );
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  updateDisability: wrapAudit(async (req, res) => {
    const data = await personsService.updateDisability(
      req.user,
      req.params.id,
      req.params.pid,
      req.params.diid,
      req.body
    );
    res.json({ success: true, data });
  }, 'Disability', 'diid'),

  removeDisability: async (req, res, next) => {
    try {
      await personsService.removeDisability(
        req.user,
        req.params.id,
        req.params.pid,
        req.params.diid
      );
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = personsController;
