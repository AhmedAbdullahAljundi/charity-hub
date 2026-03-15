const Joi = require('joi')

/**
 * Joi schema for family registration payload
 *
 * Structure:
 * {
 *   family: {...},
 *   persons: [...],
 *   incomes: [...],
 *   medicalCases: [...],
 *   educationRecords: [...]
 * }
 */

const familySchema = Joi.object({
  registration_number: Joi.string().required(),
  address: Joi.string().required(),
  region: Joi.string().allow(null, ''),
  housing_type: Joi.string().valid('OWNED', 'RENT', 'SHARED').required(),
  rent_value: Joi.number().min(0).allow(null),
  phone: Joi.string().allow(null, ''),
  notes: Joi.string().allow(null, ''),
  social_status: Joi.string().valid(
    'ORPHANS',
    'DIVORCED',
    'POOR',
    'NEEDY',
    'DISABILITY',
    'STUDENT',
    'PRISONER',
    'ELDERLY',
    'ABANDONMENT',
    'CHRONIC_DISEASE',
    'TEMPORARY_INJURY',
    'OTHER'
  ).allow(null),
})

const personSchema = Joi.object({
  full_name: Joi.string().required(),
  national_id: Joi.string().length(14).pattern(/^\d+$/).allow(null),
  role_in_family: Joi.string().valid('HUSBAND', 'WIFE', 'CHILD', 'OTHER').required(),
  gender: Joi.string().valid('MALE', 'FEMALE').required(),
  birth_date: Joi.date().iso().allow(null),
  marital_status: Joi.string().allow(null),
  education_level: Joi.string().allow(null),
  occupation: Joi.string().allow(null, ''),
  smoker: Joi.boolean().default(false),
  disability: Joi.boolean().default(false),
  deceased: Joi.boolean().default(false),
  death_year: Joi.number().integer().allow(null),
  notes: Joi.string().allow(null, ''),
})

const incomeSchema = Joi.object({
  source_type: Joi.string()
    .valid(
      'SALARY',
      'PENSION',
      'AID',
      'NAFAKA',
      'FAMILY_SUPPORT',
      'CHARITY',
      'TAKAFUL_KARAMA',
      'PROJECT',
      'PROPERTY',
      'CHILDREN_INCOME',
      'RATION_CARD',
      'OTHER'
    )
    .required(),
  amount: Joi.number().min(0).required(),
  verified: Joi.boolean().default(false),
  notes: Joi.string().allow(null, ''),
})

const medicalCaseSchema = Joi.object({
  person_id: Joi.string().uuid().optional(),
  personNationalId: Joi.string().length(14).pattern(/^\d+$/).optional(),
  disease_name: Joi.string().required(),
  disease_severity: Joi.string().valid('MILD', 'MODERATE', 'SEVERE', 'CRITICAL').allow(null),
  chronic: Joi.boolean().default(false),
  medical_category: Joi.string().valid('A', 'B', 'C', 'D').allow(null),
  doctor_name: Joi.string().allow(null, ''),
  treatment_cost: Joi.number().min(0).allow(null),
  last_service_date: Joi.date().iso().allow(null),
  next_allowed_date: Joi.date().iso().allow(null),
  notes: Joi.string().allow(null, ''),
})

const educationRecordSchema = Joi.object({
  person_id: Joi.string().uuid().optional(),
  personNationalId: Joi.string().length(14).pattern(/^\d+$/).optional(),
  school_name: Joi.string().required(),
  stage: Joi.string().allow(null),
  grade: Joi.string().allow(null),
  academic_status: Joi.string().allow(null),
  memorization_level: Joi.string().allow(null),
  performance_score: Joi.number().allow(null),
  dropout_risk: Joi.boolean().default(false),
  academic_year: Joi.number().integer().allow(null),
})

const registrationSchema = Joi.object({
  family: familySchema.required(),
  persons: Joi.array().items(personSchema).default([]),
  incomes: Joi.array().items(incomeSchema).default([]),
  medicalCases: Joi.array().items(medicalCaseSchema).default([]),
  educationRecords: Joi.array().items(educationRecordSchema).default([]),
})

function validateRegistrationPayload(payload) {
  const { error, value } = registrationSchema.validate(payload, {
    abortEarly: false,
    stripUnknown: true,
  })

  if (error) {
    const message = error.details.map((d) => d.message).join('; ')
    const err = new Error(message)
    err.name = 'ValidationError'
    throw err
  }

  return value
}

module.exports = {
  validateRegistrationPayload,
}

