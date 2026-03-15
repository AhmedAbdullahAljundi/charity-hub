/**
 * Scoring Controller
 */

const { calculateFamilyScore } = require('../../services/scoring/scoringService')
const prisma = require('../../config/prisma')

const scoringController = {
  /**
   * Calculate family score (read-only, no save)
   */
  calculate: async (req, res, next) => {
    try {
      const { familyId } = req.params

      const score = await calculateFamilyScore(familyId)

      res.json({
        success: true,
        data: score,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Recalculate and SAVE family score to database
   */
  recalculate: async (req, res, next) => {
    try {
      const { familyId } = req.params

      const scoreResult = await calculateFamilyScore(familyId)
      const { totalWeightedNeed, totalActualIncome, vulnerabilityIndex, classification, breakdown } = scoreResult.scoring

      const enumMap = {
        'VERY_FRAGILE': 'VERY_FRAGILE',
        'FRAGILE': 'FRAGILE',
        'WEAK': 'WEAK',
        'MODERATE': 'MODERATE',
        'OUT_OF_PRIORITY': 'OUT_OF_PRIORITY'
      }

      await prisma.scoring.create({
        data: {
          family_id: familyId,
          total_need: totalWeightedNeed,
          total_income: totalActualIncome,
          vulnerability_index: vulnerabilityIndex,
          classification: enumMap[classification.code] || 'MODERATE',
          breakdown: breakdown,
        },
      })

      res.json({
        success: true,
        data: scoreResult,
        message: 'تم إعادة حساب التقييم وحفظه بنجاح',
      })
    } catch (error) {
      next(error)
    }
  },
}

module.exports = scoringController
