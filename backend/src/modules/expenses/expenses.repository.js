const prisma = require('../../config/prisma')

const expensesRepository = {
  findByFamilyId: async (familyId) => {
    return prisma.expense.findMany({
      where: { family_id: familyId },
      orderBy: { created_at: 'desc' },
    })
  },

  findById: async (id) => {
    return prisma.expense.findUnique({
      where: { id },
      include: { family: true },
    })
  },

  create: async (familyId, data) => {
    return prisma.expense.create({
      data: {
        ...data,
        family_id: familyId,
        amount: parseFloat(data.amount),
      },
      include: { family: true },
    })
  },

  update: async (id, data) => {
    return prisma.expense.update({
      where: { id },
      data,
      include: { family: true },
    })
  },

  delete: async (id) => {
    return prisma.expense.delete({
      where: { id },
    })
  },
  
  checkFamilyExists: async (familyId) => {
    return prisma.family.findUnique({
      where: { id: familyId },
    })
  }
}

module.exports = expensesRepository
