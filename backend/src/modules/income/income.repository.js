const prisma = require('../../config/prisma')

const incomeRepository = {
  findByFamilyId: async (familyId) => {
    return prisma.incomeSource.findMany({
      where: { family_id: familyId },
      orderBy: { created_at: 'desc' },
    })
  },
  findById: async (id) => {
    return prisma.incomeSource.findUnique({
      where: { id },
      include: { family: true },
    })
  },
  create: async (data) => {
    return prisma.incomeSource.create({
      data,
      include: { family: true },
    })
  },
  update: async (id, data) => {
    return prisma.incomeSource.update({
      where: { id },
      data,
      include: { family: true },
    })
  },
  delete: async (id) => {
    return prisma.incomeSource.delete({
      where: { id },
    })
  },
  checkFamilyExists: async (familyId) => {
    return prisma.family.findUnique({
      where: { id: familyId },
    })
  }
}

module.exports = incomeRepository
