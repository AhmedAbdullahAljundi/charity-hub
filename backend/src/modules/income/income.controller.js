/**
 * Income Sources Controller
 */

const prisma = require('../../config/prisma')
const { AppError, NotFoundError } = require('../../utils/errors')

const incomeController = {
  /**
   * List all income sources for a family
   */
  list: async (req, res, next) => {
    try {
      const { familyId } = req.params

      const incomeSources = await prisma.incomeSource.findMany({
        where: { family_id: familyId },
        orderBy: { created_at: 'desc' },
      })

      const total = incomeSources.reduce((sum, source) => {
        return sum + parseFloat(source.amount)
      }, 0)

      res.json({
        success: true,
        data: incomeSources,
        total,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Get income source by ID
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params

      const incomeSource = await prisma.incomeSource.findUnique({
        where: { id },
        include: {
          family: true,
        },
      })

      if (!incomeSource) {
        throw new NotFoundError('Income Source')
      }

      res.json({
        success: true,
        data: incomeSource,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Create income source
   */
  create: async (req, res, next) => {
    try {
      const { familyId } = req.params
      const data = req.body

      // Verify family exists
      const family = await prisma.family.findUnique({
        where: { id: familyId },
      })

      if (!family) {
        throw new NotFoundError('Family')
      }

      const incomeSource = await prisma.incomeSource.create({
        data: {
          ...data,
          family_id: familyId,
          amount: parseFloat(data.amount),
        },
        include: {
          family: true,
        },
      })

      res.status(201).json({
        success: true,
        data: incomeSource,
        message: 'تم إضافة مصدر الدخل بنجاح',
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Update income source
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params
      const data = req.body

      if (data.amount) {
        data.amount = parseFloat(data.amount)
      }

      const incomeSource = await prisma.incomeSource.update({
        where: { id },
        data,
        include: {
          family: true,
        },
      })

      res.json({
        success: true,
        data: incomeSource,
        message: 'تم تحديث مصدر الدخل بنجاح',
      })
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Income Source')
      }
      next(error)
    }
  },

  /**
   * Delete income source
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params

      await prisma.incomeSource.delete({
        where: { id },
      })

      res.json({
        success: true,
        message: 'تم حذف مصدر الدخل بنجاح',
      })
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Income Source')
      }
      next(error)
    }
  },
}

module.exports = incomeController
