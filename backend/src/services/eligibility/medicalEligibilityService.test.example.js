/**
 * Example test file for medicalEligibilityService.js
 * 
 * Demonstrates usage and can be adapted for unit tests
 */

const {
  calculateServiceInterval,
  calculateNextAllowedDate,
  determineEligibilityStatus,
  evaluateMedicalRecordEligibility,
  ELIGIBILITY_STATUS,
} = require('./medicalEligibilityService');
const { MedicalCategory } = require('@prisma/client');

console.log('=== Medical Eligibility Service Test Examples ===\n');

// Test service interval calculation
console.log('--- Service Interval Calculation ---');
console.log('Category C (non-chronic):', calculateServiceInterval(MedicalCategory.C, false)); // 30
console.log('Category C (chronic):', calculateServiceInterval(MedicalCategory.C, true)); // 20 (30 - 10)
console.log('Category B (non-chronic):', calculateServiceInterval(MedicalCategory.B, false)); // 60
console.log('Category B (chronic):', calculateServiceInterval(MedicalCategory.B, true)); // 50 (60 - 10)
console.log('Category A (non-chronic):', calculateServiceInterval(MedicalCategory.A, false)); // 90
console.log('Category A (chronic):', calculateServiceInterval(MedicalCategory.A, true)); // 80 (90 - 10)

// Test next allowed date calculation
console.log('\n--- Next Allowed Date Calculation ---');
const today = new Date();
const lastService30DaysAgo = new Date(today);
lastService30DaysAgo.setDate(lastService30DaysAgo.getDate() - 30);

const nextAllowed = calculateNextAllowedDate(lastService30DaysAgo, 30);
console.log('Last service:', lastService30DaysAgo.toISOString());
console.log('Next allowed:', nextAllowed.toISOString());
console.log('Days difference:', Math.ceil((nextAllowed - today) / (1000 * 60 * 60 * 24)));

// Test eligibility status determination
console.log('\n--- Eligibility Status Determination ---');

// Eligible (past due)
const pastDueDate = new Date(today);
pastDueDate.setDate(pastDueDate.getDate() - 5);
const eligibleStatus = determineEligibilityStatus(pastDueDate);
console.log('Past due date:', JSON.stringify(eligibleStatus, null, 2));

// Needs review (within 7 days)
const nearFutureDate = new Date(today);
nearFutureDate.setDate(nearFutureDate.getDate() + 5);
const needsReviewStatus = determineEligibilityStatus(nearFutureDate);
console.log('Near future date (5 days):', JSON.stringify(needsReviewStatus, null, 2));

// Not eligible (more than 7 days away)
const farFutureDate = new Date(today);
farFutureDate.setDate(farFutureDate.getDate() + 20);
const notEligibleStatus = determineEligibilityStatus(farFutureDate);
console.log('Far future date (20 days):', JSON.stringify(notEligibleStatus, null, 2));

// Test medical record evaluation
console.log('\n--- Medical Record Evaluation ---');
const mockMedicalRecord = {
  id: 'record-1',
  member_id: 'member-1',
  medical_category: MedicalCategory.C,
  chronic: true,
  last_service_date: lastService30DaysAgo,
  next_allowed_date: null,
};

const evaluation = evaluateMedicalRecordEligibility(mockMedicalRecord);
console.log('Evaluation result:', JSON.stringify(evaluation, null, 2));

// Test scenarios
console.log('\n--- Test Scenarios ---');

// Scenario 1: Category C, chronic, served 25 days ago (should be eligible)
const scenario1 = {
  id: 'scenario-1',
  member_id: 'member-1',
  medical_category: MedicalCategory.C,
  chronic: true,
  last_service_date: new Date(today.getTime() - 25 * 24 * 60 * 60 * 1000),
  next_allowed_date: null,
};
const eval1 = evaluateMedicalRecordEligibility(scenario1);
console.log('Scenario 1 (Category C, chronic, 25 days ago):', eval1.eligibility.status);

// Scenario 2: Category A, non-chronic, served 50 days ago (should not be eligible yet)
const scenario2 = {
  id: 'scenario-2',
  member_id: 'member-2',
  medical_category: MedicalCategory.A,
  chronic: false,
  last_service_date: new Date(today.getTime() - 50 * 24 * 60 * 60 * 1000),
  next_allowed_date: null,
};
const eval2 = evaluateMedicalRecordEligibility(scenario2);
console.log('Scenario 2 (Category A, non-chronic, 50 days ago):', eval2.eligibility.status);

// Scenario 3: Category B, chronic, never served (should be eligible)
const scenario3 = {
  id: 'scenario-3',
  member_id: 'member-3',
  medical_category: MedicalCategory.B,
  chronic: true,
  last_service_date: null,
  next_allowed_date: null,
};
const eval3 = evaluateMedicalRecordEligibility(scenario3);
console.log('Scenario 3 (Category B, chronic, never served):', eval3.eligibility.status);

console.log('\n=== Test Complete ===');
