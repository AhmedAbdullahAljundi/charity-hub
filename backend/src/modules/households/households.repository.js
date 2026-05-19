const prisma = require('../../config/prisma');

const householdInclude = {
  persons: { include: { diseases: true, disabilities: true } },
  incomeSources: true,
  temporaryBurdens: true,
};

const householdsRepository = {
  findMany(filters, pagination) {
    const { page = 1, limit = 20 } = pagination;
    const where = {};

    if (filters.governorate) where.governorate = filters.governorate;
    if (filters.district) where.district = filters.district;
    if (filters.isDraft !== undefined) where.isDraft = filters.isDraft === 'true' || filters.isDraft === true;

    if (filters.eligibility) {
      where.scoreResults = {
        some: { systemRecommendation: filters.eligibility },
      };
    }

    return prisma.$transaction([
      prisma.household.findMany({
        where,
        include: {
          ...householdInclude,
          scoreResults: {
            orderBy: { calculatedAt: 'desc' },
            take: 1,
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.household.count({ where }),
    ]);
  },

  findById(id) {
    return prisma.household.findUnique({
      where: { id },
      include: {
        ...householdInclude,
        scoreResults: { orderBy: { calculatedAt: 'desc' }, take: 5 },
      },
    });
  },

  create(data) {
    return prisma.household.create({
      data,
      include: householdInclude,
    });
  },

  update(id, data) {
    return prisma.household.update({
      where: { id },
      data,
      include: householdInclude,
    });
  },

  delete(id) {
    return prisma.household.delete({ where: { id } });
  },

  publish(id) {
    return prisma.household.update({
      where: { id },
      data: { isDraft: false, lastDraftSavedAt: new Date() },
      include: householdInclude,
    });
  },
};

module.exports = { householdsRepository, householdInclude };
