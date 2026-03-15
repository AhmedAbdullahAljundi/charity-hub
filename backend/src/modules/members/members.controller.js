/**
 * Members Controller
 */

const prisma = require('../../config/prisma')
const { AppError, NotFoundError } = require('../../utils/errors')

const membersController = {
  /**
   * List all members for a family
   */
  list: async (req, res, next) => {
    try {
      const { familyId } = req.params

      const members = await prisma.member.findMany({
        where: { family_id: familyId },
        orderBy: { created_at: 'desc' },
        include: {
          medicalRecords: true,
          educationalTracks: true,
        },
      })

      res.json({
        success: true,
        data: members,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Get member by ID
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params

      const member = await prisma.member.findUnique({
        where: { id },
        include: {
          family: true,
          medicalRecords: true,
          educationalTracks: true,
        },
      })

      if (!member) {
        throw new NotFoundError('Member')
      }

      res.json({
        success: true,
        data: member,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Create member
   */
  create: async (req, res, next) => {
    try {
      const { familyId } = req.params
      const body = req.body

      // Verify family exists
      const family = await prisma.family.findUnique({
        where: { id: familyId },
      })

      if (!family) {
        throw new NotFoundError('Family')
      }

      const memberData = {
        full_name: body.full_name,
        age: parseInt(body.age) || 0,
        gender: body.gender,
        education_level: body.education_level,
        employment_status: body.employment_status || null,
        employment_type: body.employment_type || null,
        relationship: body.relationship || 'OTHER',
        smoker: body.smoker === true,
        disability: body.disability === true,
        disability_level: body.disability_level || null,
        chronic_disease: body.chronic_disease === true,
        disease_category: body.disease_category || null,
        national_id: body.national_id || null,
        notes: body.notes || null,
        family_id: familyId,
      }

      const member = await prisma.member.create({
        data: memberData,
        include: {
          family: true,
        },
      })

      res.status(201).json({
        success: true,
        data: member,
        message: 'تم إضافة الفرد بنجاح',
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Update member
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params
      const data = req.body

      const member = await prisma.member.update({
        where: { id },
        data,
        include: {
          family: true,
        },
      })

      res.json({
        success: true,
        data: member,
        message: 'تم تحديث بيانات الفرد بنجاح',
      })
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Member')
      }
      next(error)
    }
  },

  /**
   * Delete member
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params

      await prisma.member.delete({
        where: { id },
      })

      res.json({
        success: true,
        message: 'تم حذف الفرد بنجاح',
      })
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Member')
      }
      next(error)
    }
  },
}

module.exports = membersController
