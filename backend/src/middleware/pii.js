/**
 * PII masking + access logging for sensitive fields.
 */

const prisma = require('../config/prisma');
const { UserRole } = require('../shared/constants/enums');

function maskName(name) {
  if (!name || typeof name !== 'string') return '***';
  const parts = name.trim().split(/\s+/);
  const first = parts[0] || '';
  return `${first} ***`;
}

function maskHouseholdForViewer(household) {
  if (!household) return household;
  const copy = JSON.parse(JSON.stringify(household));
  if (copy.persons) {
    copy.persons = copy.persons.map((p) => ({
      ...p,
      name: maskName(p.name),
      nationalId: null,
      birthDate: null,
      prisonSuspicion: null,
      diseases: p.diseases?.map((d) => ({ id: d.id, name: '***', treatmentCost: d.treatmentCost })),
      disabilities: p.disabilities?.map((d) => ({
        id: d.id,
        description: '***',
        workImpact: d.workImpact,
        companion: d.companion,
      })),
    }));
  }
  if (copy.incomeSources) {
    copy.incomeSources = copy.incomeSources.map((i) => ({
      ...i,
      monthlyAmount: null,
    }));
  }
  if (copy.headName) copy.headName = maskName(copy.headName);
  if (copy.spouseName) copy.spouseName = maskName(copy.spouseName);
  if (copy.headNationalId) copy.headNationalId = null;
  if (copy.spouseNationalId) copy.spouseNationalId = null;
  return copy;
}

async function logPiiAccess(req, entity, entityId, fieldName, householdId = null) {
  if (!req.user?.userId) return;
  try {
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        householdId,
        action: 'PII_ACCESS',
        entity,
        entityId,
        fieldName,
        ip: req.ip,
        userAgent: req.get('user-agent') || null,
      },
    });
  } catch (err) {
    console.error('PII audit log failed:', err.message);
  }
}

const PII_FIELDS = [
  'Person.name',
  'Person.birthDate',
  'IncomeSource.monthlyAmount',
  'Person.prisonSuspicion',
  'Disease',
  'Disability',
];

async function logHouseholdPiiAccess(req, householdId) {
  if (!req.user?.userId || !householdId) return;
  for (const fieldName of PII_FIELDS) {
    await logPiiAccess(req, 'Household', householdId, fieldName, householdId);
  }
}

async function applyPiiResponse(req, data, householdId = null) {
  const id = householdId || data?.id;
  if (data?.persons || data?.incomeSources) {
    await logHouseholdPiiAccess(req, id);
  }
  if (req.user?.role !== UserRole.VIEWER) {
    return data;
  }
  if (data?.persons || data?.incomeSources) {
    return maskHouseholdForViewer(data);
  }
  return data;
}

module.exports = {
  maskName,
  maskHouseholdForViewer,
  applyPiiResponse,
  logPiiAccess,
};
