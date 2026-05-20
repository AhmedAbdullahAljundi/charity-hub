const prisma = require('../../config/prisma');
const { NotFoundError } = require('../../utils/errors');
const { assertHouseholdAccessById } = require('../../shared/householdAccess');

async function assertBurdenInHousehold(householdId, burdenId) {
  const burden = await prisma.temporaryBurden.findFirst({
    where: { id: burdenId, householdId },
  });
  if (!burden) throw new NotFoundError('TemporaryBurden');
  return burden;
}

const burdensService = {
  async create(user, householdId, body) {
    await assertHouseholdAccessById(user, householdId);
    return prisma.temporaryBurden.create({
      data: {
        householdId,
        type: body.type,
        grade: body.grade,
        description: body.description,
      },
    });
  },

  async update(user, householdId, burdenId, body) {
    await assertHouseholdAccessById(user, householdId);
    await assertBurdenInHousehold(householdId, burdenId);
    return prisma.temporaryBurden.update({
      where: { id: burdenId },
      data: {
        grade: body.grade,
        description: body.description,
      },
    });
  },

  async remove(user, householdId, burdenId) {
    await assertHouseholdAccessById(user, householdId);
    await assertBurdenInHousehold(householdId, burdenId);
    await prisma.temporaryBurden.delete({ where: { id: burdenId } });
  },
};

module.exports = burdensService;
