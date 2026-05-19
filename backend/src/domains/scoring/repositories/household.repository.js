const prisma = require('../../../config/prisma');

const householdRepository = {
  async findFullById(householdId) {
    return prisma.household.findUnique({
      where: { id: householdId },
      include: {
        persons: {
          include: {
            diseases: true,
            disabilities: true,
          },
        },
        incomeSources: true,
        temporaryBurdens: true,
      },
    });
  },
};

module.exports = householdRepository;
