/**
 * Example test file for scoringService.js
 * 
 * This demonstrates how to use the scoring service and can be adapted
 * for actual unit tests using Jest, Mocha, or your preferred testing framework.
 */

const {
  calculateMemberWeights,
  calculateMedicalWeights,
  calculateHousingWeight,
  calculateDisabilityBonus,
  calculateSmokerPenalty,
  calculateTotalWeightedNeed,
  calculateTotalActualIncome,
  calculateVulnerabilityIndex,
  classifyVulnerability,
} = require('./scoringService');
const { EducationLevel, MedicalCategory, HousingType } = require('@prisma/client');

// Example test data
const mockMembers = [
  {
    id: '1',
    full_name: 'أحمد محمد',
    age: 45,
    gender: 'MALE',
    education_level: EducationLevel.SECONDARY,
    employment_status: 'UNEMPLOYED',
    smoker: false,
    disability: false,
  },
  {
    id: '2',
    full_name: 'فاطمة أحمد',
    age: 40,
    gender: 'FEMALE',
    education_level: EducationLevel.PRIMARY,
    employment_status: 'HOUSEWIFE',
    smoker: false,
    disability: true, // Disabled member
  },
  {
    id: '3',
    full_name: 'محمد أحمد',
    age: 15,
    gender: 'MALE',
    education_level: EducationLevel.PREPARATORY,
    employment_status: null,
    smoker: true, // Smoker
    disability: false,
  },
];

const mockMedicalRecords = [
  {
    id: '1',
    member_id: '2',
    medical_category: MedicalCategory.C,
    chronic: true,
  },
];

const mockFamily = {
  id: 'family-1',
  housing_type: HousingType.RENT,
};

const mockIncomeSources = [
  {
    id: '1',
    type: 'AID',
    amount: 500.0,
    verified: true,
  },
  {
    id: '2',
    type: 'PENSION',
    amount: 300.0,
    verified: true,
  },
  {
    id: '3',
    type: 'OTHER',
    amount: 200.0,
    verified: false, // Not verified, should not be counted
  },
];

// Test calculations
console.log('=== Scoring Service Test Examples ===\n');

// Test member weights
const memberWeights = calculateMemberWeights(mockMembers);
console.log('Member Weights:', memberWeights);
// Expected: 0.8 (SECONDARY) + 0.7 (PRIMARY) + 0.75 (PREPARATORY) = 2.25

// Test medical weights
const medicalWeights = calculateMedicalWeights(mockMedicalRecords);
console.log('Medical Weights:', medicalWeights);
// Expected: 1.2 (Category C) + 0.8 (Chronic) = 2.0

// Test housing weight
const housingWeight = calculateHousingWeight(mockFamily.housing_type);
console.log('Housing Weight:', housingWeight);
// Expected: 1.0 (RENT)

// Test disability bonus
const disabilityBonus = calculateDisabilityBonus(mockMembers);
console.log('Disability Bonus:', disabilityBonus);
// Expected: 1.0 (one disabled member)

// Test smoker penalty
const smokerPenalty = calculateSmokerPenalty(mockMembers);
console.log('Smoker Penalty:', smokerPenalty);
// Expected: -0.2 (one smoker)

// Test total weighted need
const weightedNeed = calculateTotalWeightedNeed(mockFamily, mockMembers, mockMedicalRecords);
console.log('\nTotal Weighted Need Breakdown:', JSON.stringify(weightedNeed, null, 2));
// Expected total: 2.25 + 2.0 + 1.0 + 1.0 - 0.2 = 6.05

// Test total actual income
const totalIncome = calculateTotalActualIncome(mockIncomeSources);
console.log('\nTotal Actual Income:', totalIncome);
// Expected: 500 + 300 = 800 (only verified)

// Test vulnerability index
const baselineCoefficient = 1.0;
const vulnerabilityIndex = calculateVulnerabilityIndex(
  weightedNeed.totalWeightedNeed,
  baselineCoefficient,
  totalIncome
);
console.log('\nVulnerability Index:', vulnerabilityIndex);
// Expected: (6.05 * 1.0) / (800 + 1) = 6.05 / 801 ≈ 0.0075

// Test classification
const classification = classifyVulnerability(vulnerabilityIndex);
console.log('\nClassification:', JSON.stringify(classification, null, 2));
// Expected: OUT_OF_PRIORITY (index < 1.5)

// Example with higher vulnerability
const highVulnerabilityIndex = 5.5;
const highClassification = classifyVulnerability(highVulnerabilityIndex);
console.log('\nHigh Vulnerability Classification:', JSON.stringify(highClassification, null, 2));
// Expected: FRAGILE (index >= 5.0)

console.log('\n=== Test Complete ===');
