# Medical Eligibility Service Documentation

## Overview

The `medicalEligibilityService.js` determines medical service eligibility for families and members based on medical category, chronic disease status, and service history. It automatically calculates next allowed service dates and provides eligibility status.

## Business Rules

### Service Intervals by Category

| Category | Base Interval | With Chronic Disease |
|----------|--------------|---------------------|
| **C** | 30 days | 20 days (30 - 10) |
| **B** | 60 days | 50 days (60 - 10) |
| **A** | 90 days | 80 days (90 - 10) |

### Eligibility Status

1. **Eligible** (`Eligible` / `مؤهل`)
   - Next allowed date has passed (including today)
   - Service can be provided immediately

2. **Needs Review** (`NeedsReview` / `يحتاج مراجعة`)
   - Next allowed date is within 7 days
   - May need scheduling/preparation

3. **Not Eligible** (`NotEligible` / `غير مؤهل`)
   - Next allowed date is more than 7 days away
   - Service cannot be provided yet

### Next Allowed Date Calculation

- If `last_service_date` exists: `next_allowed_date = last_service_date + interval_days`
- If `last_service_date` is null: `next_allowed_date = today` (eligible immediately)

## Usage

### Evaluate Family Medical Eligibility

```javascript
const { evaluateFamilyMedicalEligibility } = require('./medicalEligibilityService');

// Evaluate all members in a family
const result = await evaluateFamilyMedicalEligibility('family-uuid');

console.log(result.overallEligibility.label); // "مؤهل" or "غير مؤهل" etc.
console.log(result.members); // Array of member evaluations
```

### Evaluate Member Medical Eligibility

```javascript
const { evaluateMemberMedicalEligibility } = require('./medicalEligibilityService');

// Evaluate a single member
const result = await evaluateMemberMedicalEligibility('member-uuid');

console.log(result.overallEligibility.status); // "Eligible", "NotEligible", or "NeedsReview"
console.log(result.records); // Array of medical record evaluations
```

### Update Medical Record After Service

```javascript
const { updateMedicalRecordAfterService } = require('./medicalEligibilityService');

// After providing service, update the record
const updated = await updateMedicalRecordAfterService('medical-record-uuid');

console.log(updated.nextAllowedDate); // New next allowed date
console.log(updated.serviceIntervalDays); // Interval used (e.g., 20 for Category C chronic)
```

### Batch Evaluation

```javascript
const { evaluateBatchFamilyEligibility } = require('./medicalEligibilityService');

const familyIds = ['uuid-1', 'uuid-2', 'uuid-3'];
const results = await evaluateBatchFamilyEligibility(familyIds);

results.forEach(result => {
  if (result.error) {
    console.error(`Error for ${result.familyId}:`, result.error);
  } else {
    console.log(`Family ${result.familyId}: ${result.overallEligibility.label}`);
  }
});
```

## Response Structure

### Family Eligibility Response

```json
{
  "familyId": "uuid",
  "familyNationalId": "123456789",
  "familyHeadName": "أحمد محمد",
  "hasMembers": true,
  "overallEligibility": {
    "status": "Eligible",
    "label": "مؤهل",
    "reason": "2 عضو مؤهل للخدمة الطبية"
  },
  "members": [
    {
      "memberId": "uuid",
      "memberName": "فاطمة أحمد",
      "hasMedicalRecords": true,
      "overallEligibility": {
        "status": "Eligible",
        "label": "مؤهل",
        "reason": "1 سجل طبي مؤهل للخدمة"
      },
      "records": [
        {
          "medicalRecordId": "uuid",
          "memberId": "uuid",
          "medicalCategory": "C",
          "chronic": true,
          "lastServiceDate": "2024-01-01T00:00:00.000Z",
          "calculatedNextAllowedDate": "2024-01-21T00:00:00.000Z",
          "serviceIntervalDays": 20,
          "eligibility": {
            "status": "Eligible",
            "label": "مؤهل",
            "daysUntilEligible": 0,
            "isOverdue": true
          }
        }
      ],
      "evaluatedAt": "2024-01-25T10:30:00.000Z"
    }
  ],
  "evaluatedAt": "2024-01-25T10:30:00.000Z"
}
```

### Member Eligibility Response

```json
{
  "memberId": "uuid",
  "memberName": "فاطمة أحمد",
  "hasMedicalRecords": true,
  "overallEligibility": {
    "status": "Eligible",
    "label": "مؤهل",
    "reason": "1 سجل طبي مؤهل للخدمة"
  },
  "records": [
    {
      "medicalRecordId": "uuid",
      "memberId": "uuid",
      "medicalCategory": "C",
      "chronic": true,
      "lastServiceDate": "2024-01-01T00:00:00.000Z",
      "calculatedNextAllowedDate": "2024-01-21T00:00:00.000Z",
      "serviceIntervalDays": 20,
      "eligibility": {
        "status": "Eligible",
        "label": "مؤهل",
        "daysUntilEligible": 0,
        "isOverdue": true
      }
    }
  ],
  "evaluatedAt": "2024-01-25T10:30:00.000Z"
}
```

## Integration with Database

### Auto-update next_allowed_date

After providing medical service, call `updateMedicalRecordAfterService()`:

```javascript
// In your medical service controller
const { updateMedicalRecordAfterService } = require('../services/eligibility/medicalEligibilityService');

async function provideMedicalService(req, res) {
  const { medicalRecordId, serviceDate } = req.body;
  
  // Update the record with new dates
  const updated = await updateMedicalRecordAfterService(
    medicalRecordId,
    serviceDate || new Date()
  );
  
  // Continue with service provision logic...
}
```

### Prisma Schema Requirements

The service expects the `MedicalRecord` model with:
- `id`: UUID
- `member_id`: UUID (relation to Member)
- `medical_category`: Enum (A, B, C)
- `chronic`: Boolean
- `last_service_date`: DateTime (nullable)
- `next_allowed_date`: DateTime (nullable)

## Testing

The service exports utility functions for unit testing:

```javascript
const {
  calculateServiceInterval,
  calculateNextAllowedDate,
  determineEligibilityStatus,
  evaluateMedicalRecordEligibility,
} = require('./medicalEligibilityService');
```

See `medicalEligibilityService.test.example.js` for example test cases.

## Error Handling

The service throws `AppError` instances for:
- Missing IDs: `ValidationError`
- Not found resources: `NotFoundError`
- Database errors: `AppError` with code `ELIGIBILITY_ERROR`

Always wrap calls in try-catch:

```javascript
try {
  const result = await evaluateFamilyMedicalEligibility(familyId);
} catch (error) {
  if (error.isOperational) {
    console.error(error.code, error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Performance Considerations

- Uses `Promise.all()` for parallel member evaluations
- Batch processing limits to 50 families per batch
- Efficient date calculations
- Minimal database queries with proper includes

## Examples

### Example 1: Category C, Chronic, Served 25 Days Ago

```javascript
const record = {
  medical_category: 'C',
  chronic: true,
  last_service_date: new Date('2024-01-01'),
};

// Interval = 30 - 10 = 20 days
// Next allowed = 2024-01-01 + 20 = 2024-01-21
// Today = 2024-01-25
// Status: Eligible (overdue by 4 days)
```

### Example 2: Category A, Non-Chronic, Never Served

```javascript
const record = {
  medical_category: 'A',
  chronic: false,
  last_service_date: null,
};

// Interval = 90 days
// Next allowed = today (immediately eligible)
// Status: Eligible
```

### Example 3: Category B, Chronic, Served 45 Days Ago

```javascript
const record = {
  medical_category: 'B',
  chronic: true,
  last_service_date: new Date('2024-01-01'),
};

// Interval = 60 - 10 = 50 days
// Next allowed = 2024-01-01 + 50 = 2024-02-20
// Today = 2024-01-25
// Status: Not Eligible (25 days remaining)
```

## Future Enhancements

Potential improvements:
- Custom interval rules per medical condition
- Integration with appointment scheduling
- Historical eligibility tracking
- Notification system for upcoming eligibility
- Integration with scoring service for priority ranking
