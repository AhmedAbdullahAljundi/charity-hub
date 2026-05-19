const prisma = require('../../config/prisma');

async function logFieldChanges({
  userId,
  householdId,
  action,
  entity,
  entityId,
  changes,
  ip,
  userAgent,
}) {
  if (!changes?.length) return;

  await prisma.$transaction(
    changes.map((c) =>
      prisma.auditLog.create({
        data: {
          userId,
          householdId: householdId ?? null,
          action,
          entity,
          entityId,
          fieldName: c.fieldName,
          before: c.before !== undefined ? c.before : null,
          after: c.after !== undefined ? c.after : null,
          ip: ip ?? null,
          userAgent: userAgent ?? null,
        },
      })
    )
  );
}

function diffFields(before, after, prefix = '') {
  const changes = [];
  const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  for (const key of keys) {
    if (['createdAt', 'updatedAt'].includes(key)) continue;
    if (['passwordHash', 'tokenHash'].includes(key)) continue;
    const b = before?.[key];
    const a = after?.[key];
    const fieldName = prefix ? `${prefix}.${key}` : key;
    if (JSON.stringify(b) !== JSON.stringify(a)) {
      changes.push({
        fieldName,
        before: b === undefined ? null : b,
        after: a === undefined ? null : a,
      });
    }
  }
  return changes;
}

module.exports = { logFieldChanges, diffFields };
