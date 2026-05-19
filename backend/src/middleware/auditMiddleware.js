/**
 * Field-level audit for PUT/PATCH — attach snapshot helpers on req.audit.
 */

const { diffFields, logFieldChanges } = require('../shared/audit/auditLogger');

function auditContext(entity, getEntityId = (req) => req.params.id, getHouseholdId = (req) => req.params.householdId || req.params.id) {
  return (req, res, next) => {
    req.auditMeta = {
      entity,
      entityId: typeof getEntityId === 'function' ? getEntityId(req) : getEntityId,
      householdId: typeof getHouseholdId === 'function' ? getHouseholdId(req) : getHouseholdId,
    };
    req.auditBefore = null;

    req.captureAuditBefore = (record) => {
      req.auditBefore = record;
    };

    const originalJson = res.json.bind(res);
    res.json = async function auditJson(body) {
      if (
        req.user?.userId &&
        req.auditBefore &&
        req.auditMeta &&
        ['PUT', 'PATCH'].includes(req.method) &&
        res.statusCode < 400
      ) {
        const after =
          body?.data && typeof body.data === 'object' ? body.data : body?.data ?? null;
        if (after && typeof after === 'object') {
          const changes = diffFields(req.auditBefore, after);
          const action =
            req.auditAction ||
            (req.path.includes('/verify') ? 'VERIFY_INCOME' : 'UPDATE_FIELD');
          await logFieldChanges({
            userId: req.user.userId,
            householdId: req.auditMeta.householdId,
            action,
            entity: req.auditMeta.entity,
            entityId: req.auditMeta.entityId || after.id,
            changes,
            ip: req.ip,
            userAgent: req.get('user-agent'),
          }).catch((e) => console.error('Audit middleware:', e.message));
        }
      }
      return originalJson(body);
    };

    next();
  };
}

module.exports = { auditContext };
