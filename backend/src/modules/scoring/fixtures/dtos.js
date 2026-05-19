/**
 * Test Fixtures for Scoring Engine
 */

// 1. Zero income, empty fields
const emptyDto = {
  familyId: 'f-empty',
  members: [],
  incomes: [],
  expenses: [],
  medicalCases: [],
  educationRecords: [],
};

// 2. Extremely large family
const largeFamilyDto = {
  familyId: 'f-large',
  members: Array(15).fill(0).map((_, i) => ({
    id: `m${i}`,
    name: `Member ${i}`,
    role: i === 0 ? 'HUSBAND' : 'CHILD',
    birthDate: i === 0 ? '1980-01-01' : '2015-01-01', // 1 adult, 14 children ~11yrs
  })),
  incomes: [{ amount: '5000', verified: true, sourceType: 'SALARY' }],
};

// 3. Duplicate aid sources (Fraud FR2)
const duplicateAidDto = {
  familyId: 'f-dup',
  members: [{ id: '1', role: 'HUSBAND' }],
  incomes: [
    { amount: '500', sourceType: 'TAKAFUL_KARAMA' },
    { amount: '300', sourceType: 'CHARITY' },
    { amount: '400', sourceType: 'FAMILY_SUPPORT' },
    { amount: '200', sourceType: 'AID' }
  ],
};

// 4. Conflicting data (Fraud FR3)
const conflictingDataDto = {
  familyId: 'f-conflict',
  socialStatus: 'POOR',
  members: [
    { id: '1', name: 'Child Grad', birthDate: '2020-01-01', educationLevel: 'UNIVERSITY' }, // 6yo university
    { id: '2', name: 'Dead Dad', role: 'HUSBAND', deceased: true } // deceased head
  ],
  incomes: [
    { amount: '1000', sourceType: 'PROPERTY' }, // property but poor
    { amount: '2000', sourceType: 'SALARY' }    // deceased head with salary
  ]
};

// 5. Normal family with mix of everything
const standardFamilyDto = {
  familyId: 'f-standard',
  socialStatus: 'ORPHANS',
  housingType: 'RENT',
  rentValue: 1500,
  updatedAt: new Date().toISOString(), // recent data
  members: [
    { id: '1', name: 'Wife', role: 'WIFE', birthDate: '1985-01-01', nationalId: '12345678901234' },
    { id: '2', name: 'Child', role: 'CHILD', birthDate: '2018-01-01', nationalId: '12345678901235' }
  ],
  incomes: [{ amount: '3000', verified: true, sourceType: 'SALARY' }],
  medicalCases: [],
  educationRecords: [
    { personId: '2', academicStatus: 'ENROLLED' }
  ]
};

module.exports = {
  emptyDto,
  largeFamilyDto,
  duplicateAidDto,
  conflictingDataDto,
  standardFamilyDto
};
