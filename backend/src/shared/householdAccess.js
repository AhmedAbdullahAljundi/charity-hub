const { ForbiddenError, NotFoundError } = require('../utils/errors');
const { UserRole } = require('./constants/enums');
const prisma = require('../config/prisma');

async function loadHouseholdOrThrow(householdId) {
  const household = await prisma.household.findUnique({ where: { id: householdId } });
  if (!household) throw new NotFoundError('Household');
  return household;
}

function assertHouseholdAccess(user, household) {
  if (user.role === UserRole.ADMIN || user.role === UserRole.SUPERVISOR) {
    return;
  }
  if (user.role === UserRole.VIEWER) {
    return;
  }
  if (user.role === UserRole.WORKER) {
    const dbUser = user._dbUser;
    const gov = dbUser?.assignedGovernorate;
    const dist = dbUser?.assignedDistrict;
    if (gov && household.governorate !== gov) {
      throw new ForbiddenError('Household outside assigned governorate');
    }
    if (dist && household.district !== dist) {
      throw new ForbiddenError('Household outside assigned district');
    }
    return;
  }
  throw new ForbiddenError('Access denied');
}

async function assertHouseholdAccessById(user, householdId) {
  const household = await loadHouseholdOrThrow(householdId);
  if (user.role === UserRole.WORKER && !user._dbUser) {
    user._dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { assignedGovernorate: true, assignedDistrict: true },
    });
  }
  assertHouseholdAccess(user, household);
  return household;
}

module.exports = {
  loadHouseholdOrThrow,
  assertHouseholdAccess,
  assertHouseholdAccessById,
};
