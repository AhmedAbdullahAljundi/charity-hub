/**
 * Household DTO Builder
 *
 * Transforms raw Prisma data into a pure DTO that the scoring engine consumes.
 * The engine NEVER touches Prisma — it only receives this DTO.
 */

/**
 * Build a HouseholdDTO from Prisma family data (with relations loaded).
 *
 * @param {Object} family       — Prisma Family with persons, incomes, expenses
 * @param {Array}  medicalCases — Flat array of medical cases (joined from persons)
 * @param {Array}  educationRecords — Flat array of education records
 * @returns {Object} HouseholdDTO
 */
function buildHouseholdDTO(family, medicalCases = [], educationRecords = []) {
  const persons = family.persons || [];

  const now = new Date();

  return {
    familyId: family.id,
    registrationNumber: family.registration_number,
    address: family.address || null,
    region: family.region || null,
    phone: family.phone || null,
    housingType: family.housing_type,
    rentValue: family.rent_value,
    socialStatus: family.social_status,
    notes: family.notes || null,
    createdAt: family.created_at,
    updatedAt: family.updated_at,

    members: persons.map(p => {
      const birthDate = p.birth_date ? new Date(p.birth_date) : null;
      const age = birthDate ? Math.floor((now - birthDate) / 31557600000) : null;

      return {
        id: p.id,
        name: p.full_name,
        nationalId: p.national_id,
        role: p.role_in_family,
        gender: p.gender,
        birthDate: p.birth_date,
        age,
        maritalStatus: p.marital_status,
        educationLevel: p.education_level,
        occupation: p.occupation,
        smoker: p.smoker || false,
        disability: p.disability || false,
        deceased: p.deceased || false,
        deathYear: p.death_year,
      };
    }),

    incomes: (family.incomes || []).map(i => ({
      id: i.id,
      sourceType: i.source_type,
      source: i.source_type, // alias for layer matching
      amount: i.amount,
      verified: i.verified || false,
      notes: i.notes,
    })),

    expenses: (family.expenses || []).map(e => ({
      id: e.id,
      amount: e.amount,
      category: e.category,
      description: e.description,
      date: e.date,
    })),

    medicalCases: medicalCases.map(mc => ({
      id: mc.id,
      personId: mc.person_id,
      diseaseName: mc.disease_name,
      diseaseSeverity: mc.disease_severity,
      chronic: mc.chronic || false,
      medicalCategory: mc.medical_category,
      treatmentCost: mc.treatment_cost,
      doctorName: mc.doctor_name,
      lastServiceDate: mc.last_service_date,
      nextAllowedDate: mc.next_allowed_date,
    })),

    educationRecords: educationRecords.map(er => ({
      id: er.id,
      personId: er.person_id,
      schoolName: er.school_name,
      stage: er.stage,
      grade: er.grade,
      academicStatus: er.academic_status,
      dropoutRisk: er.dropout_risk || false,
      academicYear: er.academic_year,
    })),
  };
}

module.exports = { buildHouseholdDTO };
