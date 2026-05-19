/**
 * Expenses Controller
 */

const expensesRepository = require('./expenses.repository')
const { AppError, NotFoundError } = require('../../utils/errors')

const expensesController = {
  /**
   * List all expenses for a family
   */
  list: async (req, res, next) => {
    try {
      const { familyId } = req.params

      const expenses = await expensesRepository.findByFamilyId(familyId)

      const total = expenses.reduce((sum, expense) => {
        return sum + parseFloat(expense.amount)
      }, 0)

      res.json({
        success: true,
        data: expenses,
        total,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Get expense by ID
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params

      const expense = await expensesRepository.findById(id)

      if (!expense) {
        throw new NotFoundError('Expense')
      }

      res.json({
        success: true,
        data: expense,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Create expense
   */
  create: async (req, res, next) => {
    try {
      const { familyId } = req.params
      const data = req.body

      // Verify family exists
      const family = await expensesRepository.checkFamilyExists(familyId)

      if (!family) {
        throw new NotFoundError('Family')
      }

      const expense = await expensesRepository.create(familyId, data)

      res.status(201).json({
        success: true,
        data: expense,
        message: 'تم إضافة المصروف بنجاح',
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Update expense
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params
      const data = req.body

      if (data.amount) {
        data.amount = parseFloat(data.amount)
      }

      const expense = await expensesRepository.update(id, data)

      res.json({
        success: true,
        data: expense,
        message: 'تم تحديث المصروف بنجاح',
      })
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Expense')
      }
      next(error)
    }
  },

  /**
   * Delete expense
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params

      await expensesRepository.delete(id)

      res.json({
        success: true,
        message: 'تم حذف المصروف بنجاح',
      })
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Expense')
      }
      next(error)
    }
  },
}

module.exports = expensesController
