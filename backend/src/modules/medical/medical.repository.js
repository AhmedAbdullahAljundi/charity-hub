const prisma = require('../../config/prisma')

const medicalRepository = {
  findFamilyWithMedicalRecords: async (familyId) => {
    return prisma.family.findUnique({
      where: { id: familyId },
      include: {
        members: {
          include: {
            medicalRecords: {
              orderBy: { created_at: 'desc' },
            },
          },
        },
      },
    })
  },

  findById: async (id) => {
    return prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        member: {
          include: { family: true },
        },
      },
    })
  },

  checkMemberExists: async (memberId) => {
    return prisma.member.findUnique({
      where: { id: memberId },
    })
  },

  create: async (data) => {
    return prisma.medicalRecord.create({
      data,
      include: {
        member: {
          include: { family: true },
        },
      },
    })
  },

  update: async (id, data) => {
    return prisma.medicalRecord.update({
      where: { id },
      data,
      include: {
        member: {
          include: { family: true },
        },
      },
    })
  },

  delete: async (id) => {
    return prisma.medicalRecord.delete({
      where: { id },
    })
  },
  
  getExistingRecordForUpdate: async (id) => {
    return prisma.medicalRecord.findUnique({
      where: { id },
    })
  }
}

module.exports = medicalRepository
