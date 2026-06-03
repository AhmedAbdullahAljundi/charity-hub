/**
 * Raw Prisma household → NormalizedHouseholdInput (no scoring logic).
 */

const { toDecimal } = require('../../../shared/utils/decimal');
const { WEIGHTS } = require('../registry/weights');

const MS_PER_YEAR = 31557600000;

function computeAge(birthDate) {
  const bd = birthDate instanceof Date ? birthDate : new Date(birthDate);
  return Math.floor((Date.now() - bd.getTime()) / MS_PER_YEAR);
}

/**
 * @param {import('@prisma/client').Household & { persons: any[], incomeSources: any[], temporaryBurdens: any[] }} raw
 */
function normalizeHousehold(raw) {
  if (!raw || !raw.id) {
    throw new Error('normalizeHousehold: invalid household payload');
  }

  const persons = (raw.persons || []).map((p) => {
    const educationLevel = p.educationLevel ?? 'ILLITERATE';
    const multiplier = toDecimal(WEIGHTS.EDUCATION_MULTIPLIER[educationLevel] ?? '1.0');

    return {
      id: p.id,
      name: p.name,
      age: computeAge(p.birthDate),
      gender: p.gender,
      role: p.role,
      isHead: Boolean(p.isHead),
      isResident: p.residencyStatus === 'RESIDENT',
      residencyStatus: p.residencyStatus,
      employmentType: p.employmentType ?? 'NONE',
      employmentQuality: p.employmentQuality ?? null,
      educationLevel,
      educationMultiplier: multiplier.toNumber(),
      isStudent: Boolean(p.isStudent),
      isSpecialEducation: Boolean(p.isSpecialEducation),
      studentLevel: p.studentLevel ?? null,
      alimonyStatus: p.alimonyStatus ?? null,
      isSonContributor: Boolean(p.isSonContributor),
      sonMarried: p.maritalStatus === 'MARRIED',
      sonSameHouse: p.sonSameHouse !== false,
      isBride: Boolean(p.isBride),
      brideHasSponsor: Boolean(p.brideHasSponsor),
      isPrisoner: Boolean(p.isPrisoner),
      prisonTerm: p.prisonTerm ?? null,
      prisonSuspicion: p.prisonSuspicion ?? null,
      isOrphan: Boolean(p.isOrphan),
      isDisplaced: Boolean(p.isDisplaced),
      diseases: (p.diseases || []).map((d) => ({
        name: d.name,
        treatmentCost: d.treatmentCost,
        followup: d.followup,
        workImpact: d.workImpact,
      })),
      disabilities: (p.disabilities || []).map((d) => ({
        description: d.description,
        workImpact: d.workImpact,
        companion: d.companion,
        treatmentCost: d.treatmentCost,
      })),
      markedAsL4Processed: false,
      educationRecords: (p.academicRecords || []).map(r => ({
        personId: p.id,
        isRepeating: Boolean(r.isRepeating),
        overallGrade: r.overallGrade,
      })),
    };
  });

  const incomeSources = (raw.incomeSources || []).map((s) => ({
    channel: s.channel,
    monthlyAmount: toDecimal(s.monthlyAmount),
    verified: s.verified === 'VERIFIED',
  }));

  const temporaryBurdens = (raw.temporaryBurdens || []).map((b) => ({
    type: b.type,
    grade: b.grade ?? null,
    description: b.description ?? null,
  }));

  const head = persons.find((p) => p.isHead) ?? persons.find((p) => p.role === 'HEAD');
  const headAbsent = head ? !head.isResident : false;
  const absenceReason = headAbsent ? head.residencyStatus : null;

  const flags = {
    headIsAbsent: headAbsent,
    absenceReason,
    hasWidow: absenceReason === 'ABSENT_DEATH',
    hasDivorce: absenceReason === 'ABSENT_DIVORCE',
    hasPrisonerHead: absenceReason === 'ABSENT_PRISON',
    hasOrphans: persons.some((p) => p.isOrphan),
    orphanCount: persons.filter((p) => p.isOrphan && p.role === 'CHILD' && absenceReason === 'ABSENT_DEATH').length,
    displacedCount: persons.filter((p) => p.isDisplaced && p.role === 'CHILD' && (absenceReason === 'ABSENT_DIVORCE' || absenceReason === 'ABSENT_PRISON' || (headAbsent && absenceReason !== 'ABSENT_DEATH'))).length,
    brideCount: persons.filter((p) => p.isBride).length,
    hasAnyDisease: persons.some((p) => p.diseases.length > 0),
    hasAnyDisability: persons.some((p) => p.disabilities.length > 0),
    hasAnyBride: persons.some((p) => p.isBride),
    hasSonInPrison: temporaryBurdens.some((b) => b.type === 'SON_IN_PRISON'),
    totalVerifiedSources: incomeSources.filter((s) => s.verified).length,
    pensionVerified: incomeSources.some(
      (s) => s.channel === 'PENSION' && s.verified
    ),
    pensionRecordExists: incomeSources.some((s) => s.channel === 'PENSION'),
  };

  return {
    householdId: raw.id,
    housingType: raw.housingType,
    hasRationCard: raw.hasRationCard !== false,
    hasFamilySupport: Boolean(raw.hasFamilySupport),
    hasFoodAid: Boolean(raw.hasFoodAid),
    bankAssetGrade: raw.bankAssetGrade ?? null,
    persons,
    educationRecords: persons.flatMap(p => p.educationRecords || []),
    incomeSources,
    temporaryBurdens,
    flags,
  };
}

module.exports = { normalizeHousehold, computeAge };
