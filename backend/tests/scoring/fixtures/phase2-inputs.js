/**
 * Phase 2 test fixtures — NormalizedHouseholdInput (T01–T08).
 */

const { toDecimal } = require('../../../src/shared/utils/decimal');

function person(overrides) {
  return {
    id: overrides.id ?? 'p1',
    name: overrides.name ?? 'Member',
    age: overrides.age ?? 30,
    gender: overrides.gender ?? 'MALE',
    role: overrides.role ?? 'HEAD',
    isHead: overrides.isHead ?? false,
    isResident: overrides.isResident ?? true,
    residencyStatus: overrides.residencyStatus ?? 'RESIDENT',
    employmentType: overrides.employmentType ?? 'NONE',
    employmentQuality: overrides.employmentQuality ?? null,
    educationLevel: overrides.educationLevel ?? 'ILLITERATE',
    educationMultiplier: overrides.educationMultiplier ?? 1.0,
    isStudent: overrides.isStudent ?? false,
    studentLevel: overrides.studentLevel ?? null,
    alimonyStatus: overrides.alimonyStatus ?? null,
    isSonContributor: overrides.isSonContributor ?? false,
    sonMarried: overrides.sonMarried ?? false,
    sonSameHouse: overrides.sonSameHouse ?? true,
    isBride: overrides.isBride ?? false,
    brideHasSponsor: overrides.brideHasSponsor ?? false,
    isPrisoner: overrides.isPrisoner ?? false,
    prisonTerm: overrides.prisonTerm ?? null,
    prisonSuspicion: overrides.prisonSuspicion ?? null,
    isOrphan: overrides.isOrphan ?? false,
    diseases: overrides.diseases ?? [],
    disabilities: overrides.disabilities ?? [],
    markedAsL4Processed: false,
  };
}

function channel(ch, amount, verified = false) {
  return { channel: ch, monthlyAmount: toDecimal(amount), verified };
}

function allChannelsZero(unverified = true) {
  return [
    channel('PENSION', 0, !unverified),
    channel('TAKAFUL_KARAMA', 0, !unverified),
    channel('CHARITY_1', 0, !unverified),
    channel('CHARITY_2', 0, !unverified),
    channel('CHARITY_3', 0, !unverified),
    channel('DONOR_1', 0, !unverified),
    channel('DONOR_2', 0, !unverified),
    channel('ALIMONY', 0, !unverified),
  ];
}

function baseInput(overrides) {
  return {
    householdId: overrides.householdId ?? 'test-hh',
    housingType: overrides.housingType ?? 'OWNED',
    hasRationCard: overrides.hasRationCard ?? true,
    hasFamilySupport: overrides.hasFamilySupport ?? false,
    hasFoodAid: overrides.hasFoodAid ?? false,
    bankAssetGrade: overrides.bankAssetGrade ?? null,
    persons: overrides.persons ?? [],
    incomeSources: overrides.incomeSources ?? [],
    temporaryBurdens: overrides.temporaryBurdens ?? [],
    flags: overrides.flags,
  };
}

/** T01: Widow + 3 children + rented + unverified */
const T01_WIDOW_RENTED = baseInput({
  householdId: 'T01',
  housingType: 'RENTED',
  persons: [
    person({
      id: 'h1',
      isHead: true,
      role: 'HEAD',
      age: 38,
      gender: 'FEMALE',
      residencyStatus: 'ABSENT_DEATH',
      isResident: false,
    }),
    person({ id: 's1', role: 'SPOUSE', age: 38, gender: 'FEMALE' }),
    person({
      id: 'c1',
      role: 'CHILD',
      age: 9,
      isOrphan: true,
      isStudent: true,
      studentLevel: 'PRIMARY',
    }),
    person({
      id: 'c2',
      role: 'CHILD',
      age: 12,
      isOrphan: true,
      isStudent: true,
      studentLevel: 'PREPARATORY',
    }),
    person({
      id: 'c3',
      role: 'CHILD',
      age: 6,
      isOrphan: true,
      isStudent: true,
      studentLevel: 'PRIMARY',
    }),
  ],
  incomeSources: allChannelsZero(true),
  flags: {
    headIsAbsent: true,
    absenceReason: 'ABSENT_DEATH',
    hasWidow: true,
    orphanCount: 3,
    hasOrphans: true,
    totalVerifiedSources: 0,
    pensionVerified: false,
    pensionRecordExists: false,
  },
});

/** T02: Divorced + formal alimony + owned */
const T02_DIVORCED_ALIMONY = baseInput({
  householdId: 'T02',
  housingType: 'RENTED',
  persons: [
    person({
      id: 'h1',
      isHead: true,
      role: 'HEAD',
      age: 34,
      gender: 'FEMALE',
      residencyStatus: 'ABSENT_DIVORCE',
      isResident: false,
    }),
    person({
      id: 's1',
      role: 'SPOUSE',
      age: 34,
      gender: 'FEMALE',
      alimonyStatus: 'INFORMAL_INSUFFICIENT',
      employmentQuality: 'UNSTABLE',
    }),
    person({ id: 'c1', role: 'CHILD', age: 9, isStudent: true, studentLevel: 'PRIMARY' }),
    person({ id: 'c2', role: 'CHILD', age: 6, isStudent: true, studentLevel: 'PRIMARY' }),
    person({ id: 'c3', role: 'CHILD', age: 14, isStudent: true, studentLevel: 'SECONDARY_GENERAL' }),
    person({
      id: 'd1',
      role: 'DEPENDENT_ADULT',
      age: 62,
      gender: 'FEMALE',
      employmentQuality: 'WEAK',
    }),
    person({ id: 'd2', role: 'DEPENDENT_ADULT', age: 58, gender: 'MALE' }),
    person({ id: 'd3', role: 'DEPENDENT_ADULT', age: 64, gender: 'FEMALE' }),
    person({ id: 'd4', role: 'DEPENDENT_ADULT', age: 61, gender: 'MALE', employmentQuality: 'UNSTABLE' }),
  ],
  temporaryBurdens: [
    { type: 'DEBT', grade: 'D' },
    { type: 'INJURY', grade: 'C' },
    { type: 'SURGERY', grade: 'E' },
    { type: 'BRIDE', grade: null },
  ],
  hasRationCard: false,
  incomeSources: allChannelsZero(true),
  flags: {
    headIsAbsent: true,
    absenceReason: 'ABSENT_DIVORCE',
    hasDivorce: true,
    totalVerifiedSources: 0,
    pensionVerified: false,
    pensionRecordExists: false,
  },
});

/** T03: Prisoner long + wife seasonal */
const T03_PRISON_FAMILY = baseInput({
  householdId: 'T03',
  persons: [
    person({
      id: 'h1',
      isHead: true,
      role: 'HEAD',
      age: 42,
      residencyStatus: 'ABSENT_PRISON',
      isResident: false,
      isPrisoner: true,
      prisonTerm: 'LONG',
    }),
    person({
      id: 's1',
      role: 'SPOUSE',
      age: 39,
      gender: 'FEMALE',
      employmentType: 'SEASONAL',
    }),
    person({
      id: 'c1',
      role: 'CHILD',
      age: 14,
      isStudent: true,
      studentLevel: 'SECONDARY_GENERAL',
    }),
    person({
      id: 'c2',
      role: 'CHILD',
      age: 10,
      isStudent: true,
      studentLevel: 'PRIMARY',
    }),
    person({ id: 'c3', role: 'CHILD', age: 7, isOrphan: true, isStudent: true, studentLevel: 'PRIMARY' }),
    person({ id: 'c4', role: 'CHILD', age: 5, isOrphan: true, isStudent: true, studentLevel: 'CHILD' }),
    person({ id: 'c5', role: 'CHILD', age: 3, isOrphan: true }),
  ],
  housingType: 'RENTED',
  incomeSources: allChannelsZero(true),
  temporaryBurdens: [
    { type: 'SON_IN_PRISON', grade: null },
    { type: 'INJURY', grade: 'B' },
  ],
  flags: {
    headIsAbsent: true,
    absenceReason: 'ABSENT_PRISON',
    hasPrisonerHead: true,
    hasSonInPrison: true,
    orphanCount: 3,
    hasOrphans: true,
    totalVerifiedSources: 0,
    pensionRecordExists: false,
    pensionVerified: false,
  },
});

/** T04: Disabled father + VERY_EXPENSIVE + 4 children */
const T04_SICK_DISABLED = baseInput({
  householdId: 'T04',
  housingType: 'DONATED_RENT',
  hasRationCard: false,
  persons: [
    person({
      id: 'h1',
      isHead: true,
      role: 'HEAD',
      age: 48,
      employmentType: 'WEAK',
      diseases: [
        {
          name: 'Kidney failure',
          treatmentCost: 'VERY_EXPENSIVE',
          followup: 'EXPENSIVE',
          workImpact: 'CANNOT_WORK',
        },
        {
          name: 'Diabetes',
          treatmentCost: 'PERIODIC_EXPENSIVE',
          followup: 'REGULAR',
          workImpact: 'MAJOR_WORKS',
        },
      ],
      disabilities: [
        {
          description: 'Mobility',
          workImpact: 'CANNOT_WORK',
          companion: 'FULLY_DEPENDENT',
          treatmentCost: 'PERIODIC_EXPENSIVE',
        },
      ],
    }),
    person({
      id: 's1',
      role: 'SPOUSE',
      age: 44,
      gender: 'FEMALE',
      employmentType: 'WEAK',
      disabilities: [
        {
          description: 'Chronic pain',
          workImpact: 'LIMITED',
          companion: 'NONE',
          treatmentCost: 'PERIODIC_CHEAP',
        },
      ],
    }),
    person({
      id: 'd1',
      role: 'DEPENDENT_ADULT',
      age: 67,
      gender: 'FEMALE',
      employmentQuality: 'WEAK',
    }),
    person({
      id: 'd2',
      role: 'DEPENDENT_ADULT',
      age: 70,
      gender: 'MALE',
    }),
    person({ id: 'c1', role: 'CHILD', age: 8, isStudent: true, studentLevel: 'PRIMARY' }),
    person({ id: 'c2', role: 'CHILD', age: 12, isStudent: true, studentLevel: 'PRIMARY' }),
    person({ id: 'c3', role: 'CHILD', age: 16, isStudent: true, studentLevel: 'PREPARATORY' }),
    person({ id: 'c4', role: 'CHILD', age: 4, isStudent: true, studentLevel: 'CHILD' }),
    person({
      id: 'c6',
      role: 'CHILD',
      age: 17,
      isStudent: true,
      studentLevel: 'UNIVERSITY_SCIENTIFIC',
    }),
    person({
      id: 'c5',
      role: 'CHILD',
      age: 15,
      diseases: [
        {
          name: 'Asthma',
          treatmentCost: 'PERIODIC_EXPENSIVE',
          followup: 'REGULAR',
          workImpact: 'MINOR',
        },
      ],
    }),
  ],
  temporaryBurdens: [
    { type: 'DEBT', grade: 'C' },
    { type: 'SURGERY', grade: 'D' },
    { type: 'INJURY', grade: 'D' },
  ],
  incomeSources: allChannelsZero(true),
  flags: {
    hasAnyDisease: true,
    hasAnyDisability: true,
    totalVerifiedSources: 0,
    pensionRecordExists: false,
  },
});

/** T05: Elderly + pension verified + owned */
const T05_ELDERLY_PENSION = baseInput({
  householdId: 'T05',
  hasRationCard: false,
  persons: [
    person({ id: 'h1', isHead: true, role: 'HEAD', age: 72, gender: 'MALE' }),
    person({ id: 's1', role: 'SPOUSE', age: 68, gender: 'FEMALE' }),
    person({ id: 'd1', role: 'DEPENDENT_ADULT', age: 66, gender: 'FEMALE' }),
    person({ id: 'd2', role: 'DEPENDENT_ADULT', age: 71, gender: 'MALE' }),
  ],
  temporaryBurdens: [
    { type: 'DEBT', grade: 'D' },
    { type: 'INJURY', grade: 'B' },
    { type: 'SURGERY', grade: 'E' },
    { type: 'BRIDE', grade: null },
  ],
  incomeSources: allChannelsZero(true),
  flags: {
    totalVerifiedSources: 0,
    pensionVerified: false,
    pensionRecordExists: false,
  },
});

/** T06: Large family + abroad son */
const T06_ABROAD_SON = baseInput({
  householdId: 'T06',
  persons: [
    person({ id: 'h1', isHead: true, role: 'HEAD', age: 55, employmentType: 'WEAK' }),
    person({ id: 's1', role: 'SPOUSE', age: 52, gender: 'FEMALE' }),
    person({
      id: 'son1',
      role: 'CHILD',
      age: 28,
      employmentType: 'SEASONAL',
      educationMultiplier: 1.0,
      isSonContributor: true,
      sonMarried: false,
      sonSameHouse: true,
    }),
    person({
      id: 'd1',
      role: 'DEPENDENT_ADULT',
      age: 63,
      gender: 'FEMALE',
    }),
    person({ id: 'c1', role: 'CHILD', age: 10, isStudent: true, studentLevel: 'PRIMARY' }),
    person({ id: 'c2', role: 'CHILD', age: 14, isStudent: true, studentLevel: 'PREPARATORY' }),
    person({ id: 'c3', role: 'CHILD', age: 6, isStudent: true, studentLevel: 'PRIMARY' }),
  ],
  temporaryBurdens: [{ type: 'DEBT', grade: 'C' }],
  housingType: 'SHARED',
  incomeSources: allChannelsZero(true),
  flags: { totalVerifiedSources: 0, pensionRecordExists: false, pensionVerified: false },
});

/** T07: Bride + debt D + surgery E */
const T07_BRIDE_DEBT = baseInput({
  householdId: 'T07',
  housingType: 'RENTED',
  persons: [
    person({
      id: 'h1',
      isHead: true,
      role: 'HEAD',
      age: 50,
      employmentType: 'WEAK',
      diseases: [
        {
          name: 'Hypertension',
          treatmentCost: 'VERY_EXPENSIVE',
          followup: 'EXPENSIVE',
          workImpact: 'CANNOT_WORK',
        },
      ],
      disabilities: [
        {
          description: 'Mobility',
          workImpact: 'SPECIAL_WORK',
          companion: 'OUTSIDE_ONLY',
          treatmentCost: 'PERIODIC_EXPENSIVE',
        },
      ],
    }),
    person({ id: 'b1', role: 'CHILD', age: 22, gender: 'FEMALE', isBride: true }),
    person({ id: 'c1', role: 'CHILD', age: 18, isStudent: true, studentLevel: 'SECONDARY_GENERAL' }),
  ],
  hasRationCard: false,
  temporaryBurdens: [
    { type: 'DEBT', grade: 'D' },
    { type: 'SURGERY', grade: 'E' },
    { type: 'BRIDE', grade: null },
    { type: 'INJURY', grade: 'C' },
    { type: 'INJURY', grade: 'D' },
  ],
  incomeSources: allChannelsZero(true),
  flags: { hasAnyBride: true, totalVerifiedSources: 0, pensionRecordExists: false },
});

/** T08: High income fully verified */
const T08_HIGH_INCOME = baseInput({
  householdId: 'T08',
  bankAssetGrade: 'B',
  persons: [
    person({
      id: 'h1',
      isHead: true,
      role: 'HEAD',
      age: 45,
      employmentType: 'REGULAR',
      educationMultiplier: 2.0,
      educationLevel: 'HIGHER_STABLE',
    }),
    person({
      id: 's1',
      role: 'SPOUSE',
      age: 42,
      gender: 'FEMALE',
      employmentType: 'REGULAR',
      educationMultiplier: 1.6,
      educationLevel: 'HIGHER_LIMITED',
    }),
  ],
  incomeSources: [
    channel('DONOR_1', 15000, true),
    channel('DONOR_2', 8000, true),
    channel('PENSION', 0, true),
    channel('TAKAFUL_KARAMA', 0, true),
    channel('CHARITY_1', 0, true),
    channel('CHARITY_2', 0, true),
    channel('CHARITY_3', 0, true),
    channel('ALIMONY', 0, true),
  ],
  flags: {
    totalVerifiedSources: 8,
    pensionVerified: true,
    pensionRecordExists: true,
  },
});

module.exports = {
  T01_WIDOW_RENTED,
  T02_DIVORCED_ALIMONY,
  T03_PRISON_FAMILY,
  T04_SICK_DISABLED,
  T05_ELDERLY_PENSION,
  T06_ABROAD_SON,
  T07_BRIDE_DEBT,
  T08_HIGH_INCOME,
};
