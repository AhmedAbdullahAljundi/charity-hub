const prisma = require('../../config/prisma')

const membersRepository = {
  findByFamilyId: async (familyId) => {
    return prisma.member.findMany({
      where: { family_id: familyId },
      orderBy: { created_at: 'asc' },
    })
  },
  findById: async (id) => {
    return prisma.member.findUnique({
      where: { id },
      include: { family: true },
    })
  },
  create: async (data) => {
    return prisma.member.create({
      data,
      include: { family: true },
    })
  },
  update: async (id, data) => {
    return prisma.member.update({
      where: { id },
      data,
      include: { family: true },
    })
  },
  delete: async (id) => {
    return prisma.member.delete({
      where: { id },
    })
  },
  checkFamilyExists: async (familyId) => {
    return prisma.family.findUnique({
      where: { id: familyId },
    })
  }
}

module.exports = membersRepository
