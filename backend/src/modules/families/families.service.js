/**
 * Families Service
 *
 * Handles transactional family registration:
 * - Create Family
 * - Create Persons
 * - Create Income records
 * - Create Medical & Education records
 * - Trigger PMT Scoring and persist Scoring snapshot
 */

const prisma = require('../../config/prisma')
const { VulnerabilityClassification } = require('@prisma/client')
const scoringService = require('../scoring/scoring.service')
const { AppError } = require('../../utils/errors')

/**
 * Map incoming vulnerability classification code to Prisma enum
 * @param {string} code - FRAGILE | WEAK | MODERATE | OUT_OF_PRIORITY
 */
function mapClassificationToEnum(code) {
  switch (code) {
    case 'FRAGILE':
      // Highest vulnerability → VERY_FRAGILE bucket
      return VulnerabilityClassification.VERY_FRAGILE
    case 'WEAK':
      return VulnerabilityClassification.WEAK
    case 'MODERATE':
      return VulnerabilityClassification.MODERATE
    default:
      return VulnerabilityClassification.OUT_OF_PRIORITY
  }
}

/**
 * Register family with related entities inside a single transaction.
 *
 * @param {object} payload
 * @param {object} payload.family - Family-level data
 * @param {Array<object>} [payload.persons] - Persons belonging to family
 * @param {Array<object>} [payload.incomes] - Income records
 * @param {Array<object>} [payload.medicalCases] - Medical cases with personNationalId
 * @param {Array<object>} [payload.educationRecords] - Education records with personNationalId
 */
async function registerFamily(payload) {
  const { family, persons = [], incomes = [], medicalCases = [], educationRecords = [] } = payload || {}

  if (!family) {
    throw new AppError('Family data is required', 400, 'VALIDATION_ERROR')
  }

  return prisma.$transaction(async (tx) => {
    // 1) Create Family
    const createdFamily = await tx.family.create({
      data: {
        registration_number: String(family.registration_number).trim(),
        address: String(family.address || '').trim(),
        region: family.region || null,
        housing_type: family.housing_type,
        rent_value: family.rent_value != null ? family.rent_value : null,
        phone: family.phone || null,
        notes: family.notes || null,
        social_status: family.social_status || null,
      },
    })

    // 2) Create Persons
    const personsByNationalId = new Map()

    for (const person of persons) {
      const createdPerson = await tx.person.create({
        data: {
          family_id: createdFamily.id,
          full_name: String(person.full_name).trim(),
          national_id: person.national_id || null,
          role_in_family: person.role_in_family,
          gender: person.gender,
          birth_date: person.birth_date ? new Date(person.birth_date) : null,
          marital_status: person.marital_status || null,
          education_level: person.education_level || null,
          occupation: person.occupation || null,
          smoker: Boolean(person.smoker),
          disability: Boolean(person.disability),
          deceased: Boolean(person.deceased),
          death_year: person.death_year || null,
          notes: person.notes || null,
        },
      })

      if (createdPerson.national_id) {
        personsByNationalId.set(createdPerson.national_id, createdPerson)
      }
    }

    // 3) Create Income records
    for (const income of incomes) {
      await tx.income.create({
        data: {
          family_id: createdFamily.id,
          source_type: income.source_type,
          amount: income.amount,
          verified: Boolean(income.verified),
          notes: income.notes || null,
        },
      })
    }

    // 4) Create Medical cases
    for (const mc of medicalCases) {
      const personRef =
        mc.person_id ||
        (mc.personNationalId && personsByNationalId.get(String(mc.personNationalId)))

      if (!personRef) {
        throw new AppError(
          `Person not found for medical case (nationalId=${mc.personNationalId})`,
          400,
          'VALIDATION_ERROR'
        )
      }

      await tx.medicalCase.create({
        data: {
          person_id: typeof personRef === 'string' ? personRef : personRef.id,
          disease_name: String(mc.disease_name).trim(),
          disease_severity: mc.disease_severity || null,
          chronic: Boolean(mc.chronic),
          medical_category: mc.medical_category || null,
          doctor_name: mc.doctor_name || null,
          treatment_cost: mc.treatment_cost != null ? mc.treatment_cost : null,
          last_service_date: mc.last_service_date ? new Date(mc.last_service_date) : null,
          next_allowed_date: mc.next_allowed_date ? new Date(mc.next_allowed_date) : null,
          notes: mc.notes || null,
        },
      })
    }

    // 5) Create Education records
    for (const ed of educationRecords) {
      const personRef =
        ed.person_id ||
        (ed.personNationalId && personsByNationalId.get(String(ed.personNationalId)))

      if (!personRef) {
        throw new AppError(
          `Person not found for education record (nationalId=${ed.personNationalId})`,
          400,
          'VALIDATION_ERROR'
        )
      }

      await tx.educationRecord.create({
        data: {
          person_id: typeof personRef === 'string' ? personRef : personRef.id,
          school_name: String(ed.school_name).trim(),
          stage: ed.stage || null,
          grade: ed.grade || null,
          academic_status: ed.academic_status || null,
          memorization_level: ed.memorization_level || null,
          performance_score: ed.performance_score != null ? ed.performance_score : null,
          dropout_risk: Boolean(ed.dropout_risk),
          academic_year: ed.academic_year || null,
        },
      })
    }

    // 6) Trigger scoring using new 4-engine scoring service
    const scoringResult = await scoringService.calculateAndPersist(createdFamily.id, tx)

    return {
      familyId: createdFamily.id,
      scoring: {
        vulnerabilityIndex: scoringResult.normalizedPercent != null
          ? scoringResult.normalizedPercent / 10
          : 0,
        classification: scoringResult.legacyClassification || 'MODERATE',
        systemRecommendation: scoringResult.systemRecommendation,
        normalizedPercent: scoringResult.normalizedPercent,
        scoringId: scoringResult.scoringId,
      },
    }
  })
}

module.exports = {
  registerFamily,
}

