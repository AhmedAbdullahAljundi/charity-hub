/**
 * CharityHub Scoring Service
 * 
 * Implements weighted PMT (Proxy Means Test) scoring system for family vulnerability assessment.
 * 
 * Business Logic:
 * - TotalWeightedNeed = MemberWeights + MedicalWeights + HousingWeights + DisabilityBonus - SmokerPenalty
 * - VulnerabilityIndex = (TotalWeightedNeed * BaselineCoefficient) / (TotalActualIncome + 1)
 * - Classification based on VulnerabilityIndex thresholds
 */

const prisma = require('../../config/prisma')
const { EducationLevel, MedicalCategory, HousingType, RoleInFamily } = require('@prisma/client')
const { AppError } = require('../../utils/errors')

/**
 * Education level weights mapping
 */
const EDUCATION_WEIGHTS = {
  [EducationLevel.UNIVERSITY]: 0.95,
  [EducationLevel.SECONDARY]: 0.8,
  [EducationLevel.PREPARATORY]: 0.75, // Interpolated between PRIMARY and SECONDARY
  [EducationLevel.PRIMARY]: 0.7,
  [EducationLevel.NURSERY]: 0.6,  
  [EducationLevel.NONE]: 0.5,
}

/**
 * Medical category weights
 */
const MEDICAL_WEIGHTS = {
  [MedicalCategory.D]: 1.8, // Highest severity
  [MedicalCategory.C]: 1.2,
  [MedicalCategory.B]: 0.6, // Default for category B
  [MedicalCategory.A]: 0.3, // Default for category A
}

/**
 * Chronic disease weight
 */
const CHRONIC_DISEASE_WEIGHT = 0.8;

/**
 * Housing type weights
 */
const HOUSING_WEIGHTS = {
  [HousingType.RENT]: 1.0,
  [HousingType.SHARED]: 0.6,
  [HousingType.OWNED]: 0.0, // No additional weight for owned housing
}

/**
 * Disability bonus per disabled member
 */
const DISABILITY_BONUS = 1.0;

/**
 * Smoker penalty per smoker
 */
const SMOKER_PENALTY = -0.2;

/**
 * Vulnerability classification thresholds
 */
const VULNERABILITY_THRESHOLDS = {
  VERY_FRAGILE: 8.0,
  FRAGILE: 5.0,
  WEAK: 3.0,
  MODERATE: 1.5,
}

/**
 * Arabic classification labels
 */
const CLASSIFICATION_LABELS = {
  VERY_FRAGILE: 'هش للغاية (حرج)',
  FRAGILE: 'هش للغاية',
  WEAK: 'ضعيف',
  MODERATE: 'متوسط',
  OUT_OF_PRIORITY: 'خارج الأولوية',
}

/**
 * Calculate member weight based on education level
 * @param {string} educationLevel - Education level enum value
 * @returns {number} Member weight
 */
function calculateMemberWeight(educationLevel) {
  return EDUCATION_WEIGHTS[educationLevel] || EDUCATION_WEIGHTS[EducationLevel.NONE]
}

/**
 * Calculate total member weights for all family members
 * @param {Array} members - Array of member objects with education_level
 * @returns {number} Total member weights
 */
function calculateMemberWeights(members) {
  if (!members || members.length === 0) {
    return 0
  }

  return members.reduce((total, member) => {
    const weight = calculateMemberWeight(member.education_level)
    return total + weight
  }, 0)
}

/**
 * Calculate medical weights based on medical records
 * @param {Array} medicalRecords - Array of medical record objects
 * @returns {number} Total medical weights
 */
function calculateMedicalWeights(medicalRecords) {
  if (!medicalRecords || medicalRecords.length === 0) {
    return 0
  }

  let totalWeight = 0

  medicalRecords.forEach((record) => {
    // Add category weight
    const categoryWeight = MEDICAL_WEIGHTS[record.medical_category] || 0
    totalWeight += categoryWeight

    // Add chronic disease weight if applicable
    if (record.chronic) {
      totalWeight += CHRONIC_DISEASE_WEIGHT
    }
  })

  return totalWeight
}

/**
 * Calculate housing weight based on housing type
 * @param {string} housingType - Housing type enum value
 * @returns {number} Housing weight
 */
function calculateHousingWeight(housingType) {
  return HOUSING_WEIGHTS[housingType] || 0
}

/**
 * Calculate disability bonus for all disabled members
 * @param {Array} members - Array of member objects with disability flag
 * @returns {number} Total disability bonus
 */
function calculateDisabilityBonus(members) {
  if (!members || members.length === 0) {
    return 0
  }

  return members.filter((member) => member.disability === true).length * DISABILITY_BONUS
}

/**
 * Calculate smoker penalty for all smokers
 * @param {Array} members - Array of member objects with smoker flag
 * @returns {number} Total smoker penalty (negative value)
 */
function calculateSmokerPenalty(members) {
  if (!members || members.length === 0) {
    return 0
  }

  const smokerCount = members.filter((member) => member.smoker === true).length
  return smokerCount * SMOKER_PENALTY
}

/**
 * Calculate total weighted need
 * @param {Object} familyData - Family data object
 * @param {Array} members - Array of member objects
 * @param {Array} medicalRecords - Array of medical record objects
 * @returns {Object} Breakdown of weighted need components
 */
function calculateTotalWeightedNeed(familyData, members, medicalRecords) {
  const memberWeights = calculateMemberWeights(members)
  const medicalWeights = calculateMedicalWeights(medicalRecords)
  const housingWeight = calculateHousingWeight(familyData.housing_type)
  const disabilityBonus = calculateDisabilityBonus(members)
  const smokerPenalty = calculateSmokerPenalty(members)

  const totalWeightedNeed =
    memberWeights +
    medicalWeights +
    housingWeight +
    disabilityBonus +
    smokerPenalty // Penalty is already negative

  return {
    memberWeights,
    medicalWeights,
    housingWeight,
    disabilityBonus,
    smokerPenalty: Math.abs(smokerPenalty), // Return as positive for display
    smokerCount: members.filter((m) => m.smoker === true).length,
    totalWeightedNeed: Math.max(0, totalWeightedNeed), // Ensure non-negative
  }
}

/**
 * Calculate total actual income from verified income sources
 * @param {Array} incomeSources - Array of income source objects
 * @returns {number} Total verified income
 */
function calculateTotalActualIncome(incomes) {
  if (!incomes || incomes.length === 0) {
    return 0
  }

  return incomes
    .reduce((total, income) => {
      // Convert Decimal to number
      const amount =
        typeof income.amount === 'object'
          ? parseFloat(income.amount.toString())
          : parseFloat(income.amount)
      return total + amount
    }, 0)
}

/**
 * Get baseline coefficient from ScoringRule table
 * @param {string} ruleKey - Rule key (default: 'BASELINE_COEFFICIENT')
 * @returns {Promise<number>} Baseline coefficient value
 */
async function getBaselineCoefficient(ruleKey = 'BASELINE_COEFFICIENT', tx = null) {
  const client = tx || prisma
  try {
    const rule = await client.scoringRule.findUnique({
      where: {
        rule_key: ruleKey,
        active: true,
      },
    })

    if (!rule) {
      // Default fallback coefficient if rule not found
      console.warn(`ScoringRule with key '${ruleKey}' not found. Using default coefficient: 1.0`)
      return 1.0
    }

    return rule.coefficient
  } catch (error) {
    console.error('Error fetching baseline coefficient:', error)
    // Fallback to default
    return 1.0
  }
}

/**
 * Calculate vulnerability index
 * @param {number} totalWeightedNeed - Total weighted need score
 * @param {number} baselineCoefficient - Baseline coefficient from ScoringRule
 * @param {number} totalActualIncome - Total verified income
 * @returns {number} Vulnerability index
 */
function calculateVulnerabilityIndex(totalWeightedNeed, baselineCoefficient, totalActualIncome) {
  if (totalWeightedNeed <= 0) {
    return 0
  }

  const numerator = totalWeightedNeed * baselineCoefficient
  const denominator = totalActualIncome + 1 // +1 to avoid division by zero

  return numerator / denominator
}

/**
 * Classify vulnerability based on index
 * @param {number} vulnerabilityIndex - Calculated vulnerability index
 * @returns {Object} Classification object with code and Arabic label
 */
function classifyVulnerability(vulnerabilityIndex) {
  if (vulnerabilityIndex >= VULNERABILITY_THRESHOLDS.VERY_FRAGILE) {
    return {
      code: 'VERY_FRAGILE',
      label: CLASSIFICATION_LABELS.VERY_FRAGILE,
      threshold: VULNERABILITY_THRESHOLDS.VERY_FRAGILE,
    }
  }

  if (vulnerabilityIndex >= VULNERABILITY_THRESHOLDS.FRAGILE) {
    return {
      code: 'FRAGILE',
      label: CLASSIFICATION_LABELS.FRAGILE,
      threshold: VULNERABILITY_THRESHOLDS.FRAGILE,
    }
  }

  if (vulnerabilityIndex >= VULNERABILITY_THRESHOLDS.WEAK) {
    return {
      code: 'WEAK',
      label: CLASSIFICATION_LABELS.WEAK,
      threshold: VULNERABILITY_THRESHOLDS.WEAK,
    }
  }

  if (vulnerabilityIndex >= VULNERABILITY_THRESHOLDS.MODERATE) {
    return {
      code: 'MODERATE',
      label: CLASSIFICATION_LABELS.MODERATE,
      threshold: VULNERABILITY_THRESHOLDS.MODERATE,
    }
  }

  return {
    code: 'OUT_OF_PRIORITY',
    label: CLASSIFICATION_LABELS.OUT_OF_PRIORITY,
    threshold: VULNERABILITY_THRESHOLDS.MODERATE,
  }
}

/**
 * Main scoring function - Calculate complete scoring for a family
 * @param {string} familyId - Family UUID
 * @param {Object} options - Optional parameters
 * @param {string} options.baselineRuleKey - Custom baseline rule key (default: 'BASELINE_COEFFICIENT')
 * @returns {Promise<Object>} Complete scoring result with breakdown
 */
async function calculateFamilyScore(familyId, options = {}, tx = null) {
  const client = tx || prisma
  if (!familyId) {
    throw new AppError('Family ID is required', 400, 'VALIDATION_ERROR')
  }

  try {
    // Fetch all required data in parallel for performance
    const [family, persons, incomes, medicalCases, expenses] = await Promise.all([
      client.family.findUnique({
        where: { id: familyId },
        select: {
          id: true,
          registration_number: true,
          housing_type: true,
        },
      }),
      client.person.findMany({
        where: { family_id: familyId },
        select: {
          id: true,
          full_name: true,
          gender: true,
          education_level: true,
          occupation: true,
          smoker: true,
          disability: true,
          role_in_family: true,
        },
      }),
      client.income.findMany({
        where: { family_id: familyId },
        select: {
          id: true,
          source_type: true,
          amount: true,
          verified: true,
        },
      }),
      client.medicalCase.findMany({
        where: {
          person: {
            family_id: familyId,
          },
        },
        select: {
          id: true,
          person_id: true,
          medical_category: true,
          chronic: true,
        },
      }),
      client.expense.findMany({
        where: { family_id: familyId },
        select: {
          id: true,
          amount: true,
          category: true,
        }
      })
    ])

    if (!family) {
      throw new AppError(`Family with ID ${familyId} not found`, 404, 'NOT_FOUND')
    }

    // Identify head of family (prefer HUSBAND/WIFE, fallback to first person)
    const headPerson =
      persons.find(
        (p) => p.role_in_family === RoleInFamily.HUSBAND || p.role_in_family === RoleInFamily.WIFE
      ) || persons[0] || null

    // Calculate components
    const weightedNeedBreakdown = calculateTotalWeightedNeed(family, persons, medicalCases)
    const totalActualIncome = calculateTotalActualIncome(incomes)

    // Calculate expenses
    const totalExpenses = expenses.reduce((sum, exp) => {
      const amount =
        typeof exp.amount === 'object' && exp.amount !== null
          ? parseFloat(exp.amount.toString())
          : parseFloat(exp.amount || 0)
      return sum + amount
    }, 0)

    // Calculate net disposable income (minimum 0)
    // Needs are greater if income is eaten by expenses (e.g., rent, medical)
    const netIncome = Math.max(0, totalActualIncome - totalExpenses)

    const baselineCoefficient = await getBaselineCoefficient(options.baselineRuleKey, tx)
    const vulnerabilityIndex = calculateVulnerabilityIndex(
      weightedNeedBreakdown.totalWeightedNeed,
      baselineCoefficient,
      netIncome
    )
    const classification = classifyVulnerability(vulnerabilityIndex)

    // Build comprehensive result
    const result = {
      familyId: family.id,
      familyRegistrationNumber: family.registration_number,
      familyHeadName: headPerson ? headPerson.full_name : null,
      calculatedAt: new Date().toISOString(),
      scoring: {
        totalWeightedNeed: parseFloat(weightedNeedBreakdown.totalWeightedNeed.toFixed(2)),
        breakdown: {
          memberWeights: parseFloat(weightedNeedBreakdown.memberWeights.toFixed(2)),
          medicalWeights: parseFloat(weightedNeedBreakdown.medicalWeights.toFixed(2)),
          housingWeight: parseFloat(weightedNeedBreakdown.housingWeight.toFixed(2)),
          disabilityBonus: parseFloat(weightedNeedBreakdown.disabilityBonus.toFixed(2)),
          smokerPenalty: parseFloat(weightedNeedBreakdown.smokerPenalty.toFixed(2)),
          smokerCount: weightedNeedBreakdown.smokerCount,
          expenses: parseFloat(totalExpenses.toFixed(2)),
        },
        totalActualIncome: parseFloat(totalActualIncome.toFixed(2)),
        netIncome: parseFloat(netIncome.toFixed(2)),
        baselineCoefficient: parseFloat(baselineCoefficient.toFixed(4)),
        vulnerabilityIndex: parseFloat(vulnerabilityIndex.toFixed(4)),
        classification,
      },
      metadata: {
        memberCount: persons.length,
        incomeSourceCount: incomes.length,
        verifiedIncomeCount: incomes.filter((i) => i.verified).length,
        medicalRecordCount: medicalCases.length,
        disabledMemberCount: persons.filter((m) => m.disability).length,
      },
    }

    return result
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    console.error('Error calculating family score:', error)
    throw new AppError('Failed to calculate family score', 500, 'SCORING_ERROR', {
      originalError: error.message,
    })
  }
}

/**
 * Batch calculate scores for multiple families
 * @param {Array<string>} familyIds - Array of family UUIDs
 * @param {Object} options - Optional parameters
 * @returns {Promise<Array>} Array of scoring results
 */
async function calculateBatchFamilyScores(familyIds, options = {}) {
  if (!Array.isArray(familyIds) || familyIds.length === 0) {
    throw new AppError('Family IDs array is required', 400, 'VALIDATION_ERROR')
  }

  // Limit batch size to prevent memory issues
  const BATCH_SIZE = 50
  const results = []

  for (let i = 0; i < familyIds.length; i += BATCH_SIZE) {
    const batch = familyIds.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.allSettled(
      batch.map((id) => calculateFamilyScore(id, options))
    )

    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      } else {
        // Log error but continue processing
        console.error(`Failed to calculate score for family ${batch[index]}:`, result.reason)
        results.push({
          familyId: batch[index],
          error: result.reason.message,
          calculatedAt: new Date().toISOString(),
        })
      }
    })
  }

  return results
}

module.exports = {
  calculateFamilyScore,
  calculateBatchFamilyScores,
  // Exported for testing
  calculateMemberWeights,
  calculateMedicalWeights,
  calculateHousingWeight,
  calculateDisabilityBonus,
  calculateSmokerPenalty,
  calculateTotalWeightedNeed,
  calculateTotalActualIncome,
  calculateVulnerabilityIndex,
  classifyVulnerability,
  getBaselineCoefficient,
  // Constants for reference
  EDUCATION_WEIGHTS,
  MEDICAL_WEIGHTS,
  HOUSING_WEIGHTS,
  DISABILITY_BONUS,
  SMOKER_PENALTY,
  VULNERABILITY_THRESHOLDS,
  CLASSIFICATION_LABELS,
}
