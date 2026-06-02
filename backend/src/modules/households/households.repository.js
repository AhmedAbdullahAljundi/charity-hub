const prisma = require('../../config/prisma');

const householdInclude = {
  persons: { include: { diseases: true, disabilities: true, academicRecords: { orderBy: { academicYear: 'desc' }, take: 1 } } },
  incomeSources: true,
  temporaryBurdens: true,
};

const householdsRepository = {
  findMany(filters, pagination) {
    const { page = 1, limit = 20 } = pagination;
    const where = {};
    const and = [];

    if (filters.governorate) where.governorate = filters.governorate;
    if (filters.district) where.district = filters.district;
    if (filters.exactCode) where.code = filters.exactCode;
    if (filters.isDraft !== undefined) where.isDraft = filters.isDraft === 'true' || filters.isDraft === true;
    if (filters.search) {
      const contains = String(filters.search).trim();
      if (contains) {
        and.push({
          OR: [
            { code: { contains, mode: 'insensitive' } },
            { governorate: { contains, mode: 'insensitive' } },
            { district: { contains, mode: 'insensitive' } },
            { village: { contains, mode: 'insensitive' } },
            { address: { contains, mode: 'insensitive' } },
            { primaryPhone: { contains, mode: 'insensitive' } },
            { secondaryPhone: { contains, mode: 'insensitive' } },
            { backupPhone: { contains, mode: 'insensitive' } },
            { whatsappPhone: { contains, mode: 'insensitive' } },
            {
              persons: {
                some: {
                  OR: [
                    { name: { contains, mode: 'insensitive' } },
                    { nationalId: { contains, mode: 'insensitive' } },
                  ],
                },
              },
            },
          ],
        });
      }
    }

    if (filters.eligibility) {
      and.push({ scoreResults: { some: { systemRecommendation: filters.eligibility } } });
    }

    if (filters.decisionStatus) {
      and.push({ scoreResults: { some: { humanDecision: filters.decisionStatus } } });
    }

    if (filters.classification) {
      and.push({
        scoreResults: {
          some: {
            decisionNote: { contains: filters.classification, mode: 'insensitive' },
          },
        },
      });
    }

    if (and.length) where.AND = and;

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
        orderBy: buildOrderBy(filters.sort, filters.sortBy, filters.sortOrder),
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

function buildOrderBy(sort, sortBy, sortOrder) {
  const fallback = [{ updatedAt: 'desc' }];
  const rawSort = sort || (sortBy ? `${sortBy}:${sortOrder || 'asc'}` : '');
  if (!rawSort) return fallback;

  const sortableColumns = {
    code: 'code',
    wifeName: 'updatedAt',
    husbandName: 'updatedAt',
    district: 'district',
    address: 'district',
    totalIncome: 'updatedAt',
    normalizedPercent: 'updatedAt',
    eligibility: 'updatedAt',
    updatedAt: 'updatedAt',
  };

  const orderBy = String(rawSort)
    .split(',')
    .map((item) => {
      const [column, direction] = item.split(':');
      const field = sortableColumns[column];
      if (!field) return null;
      return { [field]: direction === 'desc' ? 'desc' : 'asc' };
    })
    .filter(Boolean);

  return orderBy.length ? orderBy : fallback;
}

module.exports = { householdsRepository, householdInclude };
