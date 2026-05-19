const prisma = require('../../config/prisma')

const familiesRepository = {
  findMany: async (where, skip, take) => {
    return prisma.family.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: 'desc' },
      include: {
        persons: {
          where: {
            OR: [{ role_in_family: 'HUSBAND' }, { role_in_family: 'WIFE' }],
          },
          take: 1,
        },
        scoringRecords: {
          orderBy: { calculated_at: 'desc' },
          take: 1,
        },
        _count: {
          select: { persons: true },
        },
      },
    })
  },

  count: async (where) => {
    return prisma.family.count({ where })
  },

  findById: async (id) => {
    return prisma.family.findUnique({
      where: { id },
      include: {
        persons: {
          include: {
            medicalCases: true,
            educationRecords: true,
          },
        },
        incomes: true,
        expenses: true,
        scoringRecords: {
          orderBy: { calculated_at: 'desc' },
        },
      },
    })
  },

  update: async (id, data) => {
    return prisma.family.update({
      where: { id },
      data,
      include: {
        persons: true,
        incomes: true,
        expenses: true,
        scoringRecords: {
          orderBy: { calculated_at: 'desc' },
          take: 1,
        },
      },
    })
  },

  delete: async (id) => {
    return prisma.family.delete({
      where: { id },
    })
  },

  getLatestScoring: async (familyId) => {
    return prisma.scoring.findFirst({
      where: { family_id: familyId },
      orderBy: { calculated_at: 'desc' },
    })
  },

  // Persons
  createPerson: async (data) => prisma.person.create({ data }),
  updatePerson: async (id, data) => prisma.person.update({ where: { id }, data }),
  deletePerson: async (id) => prisma.person.delete({ where: { id } }),
  getPersonById: async (id) => prisma.person.findUnique({ where: { id } }),

  // Incomes
  createIncome: async (data) => prisma.income.create({ data }),
  deleteIncome: async (id) => prisma.income.delete({ where: { id } }),

  // Expenses
  createExpense: async (data) => prisma.expense.create({ data }),
  deleteExpense: async (id) => prisma.expense.delete({ where: { id } }),

  // Medical Cases
  createMedicalCase: async (data) => prisma.medicalCase.create({ data }),
  deleteMedicalCase: async (id) => prisma.medicalCase.delete({ where: { id } }),
}

module.exports = familiesRepository
