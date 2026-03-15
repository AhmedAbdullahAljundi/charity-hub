/**
 * Medical Records Controller
 */

const prisma = require('../../config/prisma')
const { evaluateFamilyMedicalEligibility } = require('../../services/eligibility/medicalEligibilityService')
const { AppError, NotFoundError } = require('../../utils/errors')

const medicalController = {
  /**
   * List all medical records for a family
   */
  list: async (req, res, next) => {
    try {
      const { familyId } = req.params

      // Get family with members and their medical records
      const family = await prisma.family.findUnique({
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

      if (!family) {
        throw new NotFoundError('Family')
      }

      // Flatten medical records with member info
      const medicalRecords = family.members.flatMap((member) =>
        member.medicalRecords.map((record) => ({
          ...record,
          member: {
            id: member.id,
            full_name: member.full_name,
            age: member.age,
          },
        }))
      )

      res.json({
        success: true,
        data: medicalRecords,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Get medical record by ID
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params

      const medicalRecord = await prisma.medicalRecord.findUnique({
        where: { id },
        include: {
          member: {
            include: {
              family: true,
            },
          },
        },
      })

      if (!medicalRecord) {
        throw new NotFoundError('Medical Record')
      }

      res.json({
        success: true,
        data: medicalRecord,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Create medical record
   */
  create: async (req, res, next) => {
    try {
      const { memberId } = req.params
      const data = req.body

      // Verify member exists
      const member = await prisma.member.findUnique({
        where: { id: memberId },
      })

      if (!member) {
        throw new NotFoundError('Member')
      }

      // Calculate next_allowed_date based on category and chronic status
      let nextAllowedDate = null
      if (data.last_service_date) {
        const lastServiceDate = new Date(data.last_service_date)
        let daysInterval = 90 // Category A default

        if (data.medical_category === 'B') {
          daysInterval = 60
        } else if (data.medical_category === 'C') {
          daysInterval = 30
        }

        // Reduce by 10 days if chronic
        if (data.chronic === true) {
          daysInterval -= 10
        }

        nextAllowedDate = new Date(lastServiceDate)
        nextAllowedDate.setDate(nextAllowedDate.getDate() + daysInterval)
      }

      const recordData = {
        medical_category: data.medical_category,
        disease_name: data.disease_name || null,
        chronic: data.chronic === true,
        last_service_date: data.last_service_date ? new Date(data.last_service_date) : null,
        next_allowed_date: nextAllowedDate,
        notes: data.notes || null,
        member_id: memberId,
      }

      const medicalRecord = await prisma.medicalRecord.create({
        data: recordData,
        include: {
          member: {
            include: {
              family: true,
            },
          },
        },
      })

      res.status(201).json({
        success: true,
        data: medicalRecord,
        message: 'تم إضافة السجل الطبي بنجاح',
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Update medical record
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params
      const data = req.body

      // Recalculate next_allowed_date if category or last_service_date changed
      if (data.last_service_date || data.medical_category || data.chronic !== undefined) {
        const existing = await prisma.medicalRecord.findUnique({
          where: { id },
        })

        const lastServiceDate = data.last_service_date
          ? new Date(data.last_service_date)
          : existing.last_service_date
        const category = data.medical_category || existing.medical_category
        const chronic = data.chronic !== undefined ? data.chronic : existing.chronic

        if (lastServiceDate) {
          let daysInterval = 90 // Category A default

          if (category === 'B') {
            daysInterval = 60
          } else if (category === 'C') {
            daysInterval = 30
          }

          // Reduce by 10 days if chronic
          if (chronic === true) {
            daysInterval -= 10
          }

          const nextAllowedDate = new Date(lastServiceDate)
          nextAllowedDate.setDate(nextAllowedDate.getDate() + daysInterval)
          data.next_allowed_date = nextAllowedDate
        }
      }

      const medicalRecord = await prisma.medicalRecord.update({
        where: { id },
        data,
        include: {
          member: {
            include: {
              family: true,
            },
          },
        },
      })

      res.json({
        success: true,
        data: medicalRecord,
        message: 'تم تحديث السجل الطبي بنجاح',
      })
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Medical Record')
      }
      next(error)
    }
  },

  /**
   * Delete medical record
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params

      await prisma.medicalRecord.delete({
        where: { id },
      })

      res.json({
        success: true,
        message: 'تم حذف السجل الطبي بنجاح',
      })
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Medical Record')
      }
      next(error)
    }
  },

  /**
   * Evaluate medical eligibility for a family
   */
  evaluate: async (req, res, next) => {
    try {
      const { familyId } = req.params

      const eligibility = await evaluateFamilyMedicalEligibility(familyId)

      res.json({
        success: true,
        data: eligibility,
      })
    } catch (error) {
      next(error)
    }
  },
}

module.exports = medicalController
