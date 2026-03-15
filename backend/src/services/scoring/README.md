# Scoring Service Documentation

## Overview

The `scoringService.js` implements a comprehensive **Proxy Means Test (PMT)** scoring system for assessing family vulnerability in CharityHub. It calculates a weighted need score based on multiple factors and classifies families into vulnerability categories.

## Business Logic

### Total Weighted Need Calculation

```
TotalWeightedNeed = 
  MemberWeights + 
  MedicalWeights + 
  HousingWeights + 
  DisabilityBonus - 
  SmokerPenalty
```

### Component Weights

#### Education Weights (per member)
- `UNIVERSITY`: 0.95
- `SECONDARY`: 0.8
- `PREPARATORY`: 0.75
- `PRIMARY`: 0.7
- `NONE`: 0.5

#### Medical Weights
- **Category C**: +1.2
- **Category B**: +0.6
- **Category A**: +0.3
- **Chronic Disease**: +0.8 (additional)

#### Housing Weights
- `RENT`: +1.0
- `SHARED`: +0.6
- `OWNED`: +0.0

#### Disability Bonus
- **Per disabled member**: +1.0

#### Smoker Penalty
- **Per smoker**: -0.2

### Vulnerability Index Formula

```
VulnerabilityIndex = (TotalWeightedNeed × BaselineCoefficient) / (TotalActualIncome + 1)
```

Where:
- `BaselineCoefficient` is fetched from the `ScoringRule` table (rule_key: `BASELINE_COEFFICIENT`)
- `TotalActualIncome` is the sum of all **verified** income sources

### Classification Thresholds

| Index Range | Code | Arabic Label |
|------------|------|--------------|
| ≥ 5.0 | `FRAGILE` | هش للغاية |
| ≥ 3.0 | `WEAK` | ضعيف |
| ≥ 1.5 | `MODERATE` | متوسط |
| < 1.5 | `OUT_OF_PRIORITY` | خارج الأولوية |

## Usage

### Basic Usage

```javascript
const { calculateFamilyScore } = require('./scoringService');

// Calculate score for a single family
const result = await calculateFamilyScore('family-uuid-here');

console.log(result);
```

### Response Structure

```json
{
  "familyId": "uuid",
  "familyNationalId": "123456789",
  "familyHeadName": "أحمد محمد",
  "calculatedAt": "2024-01-15T10:30:00.000Z",
  "scoring": {
    "totalWeightedNeed": 6.05,
    "breakdown": {
      "memberWeights": 2.25,
      "medicalWeights": 2.0,
      "housingWeight": 1.0,
      "disabilityBonus": 1.0,
      "smokerPenalty": 0.2,
      "smokerCount": 1
    },
    "totalActualIncome": 800.0,
    "baselineCoefficient": 1.0,
    "vulnerabilityIndex": 0.0075,
    "classification": {
      "code": "OUT_OF_PRIORITY",
      "label": "خارج الأولوية",
      "threshold": 1.5
    }
  },
  "metadata": {
    "memberCount": 3,
    "incomeSourceCount": 3,
    "verifiedIncomeCount": 2,
    "medicalRecordCount": 1,
    "disabledMemberCount": 1
  }
}
```

### Batch Processing

```javascript
const { calculateBatchFamilyScores } = require('./scoringService');

// Calculate scores for multiple families
const familyIds = ['uuid-1', 'uuid-2', 'uuid-3'];
const results = await calculateBatchFamilyScores(familyIds);

results.forEach(result => {
  if (result.error) {
    console.error(`Error for ${result.familyId}:`, result.error);
  } else {
    console.log(`Family ${result.familyId}: ${result.scoring.classification.label}`);
  }
});
```

### Custom Baseline Coefficient

```javascript
// Use a different baseline rule key
const result = await calculateFamilyScore('family-uuid', {
  baselineRuleKey: 'CUSTOM_BASELINE_COEFFICIENT'
});
```

## Database Requirements

### ScoringRule Table

The service expects a `ScoringRule` record with:
- `rule_key`: `'BASELINE_COEFFICIENT'`
- `coefficient`: A numeric value (default: 1.0 if not found)
- `active`: `true`

Example Prisma seed:

```javascript
await prisma.scoringRule.upsert({
  where: { rule_key: 'BASELINE_COEFFICIENT' },
  update: { coefficient: 1.0, active: true },
  create: {
    rule_key: 'BASELINE_COEFFICIENT',
    coefficient: 1.0,
    description: 'Baseline coefficient for vulnerability index calculation',
    active: true,
  },
});
```

## Testing

The service exports individual calculation functions for unit testing:

```javascript
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
```

See `scoringService.test.example.js` for example test cases.

## Error Handling

The service throws `AppError` instances for:
- Missing family ID: `ValidationError`
- Family not found: `NotFoundError`
- Database errors: `AppError` with code `SCORING_ERROR`

Always wrap calls in try-catch:

```javascript
try {
  const result = await calculateFamilyScore(familyId);
} catch (error) {
  if (error.isOperational) {
    // Handle expected errors
    console.error(error.code, error.message);
  } else {
    // Handle unexpected errors
    console.error('Unexpected error:', error);
  }
}
```

## Performance Considerations

- The service uses `Promise.all()` to fetch family data in parallel
- Batch processing limits to 50 families per batch to prevent memory issues
- All calculations are synchronous and optimized for performance
- Decimal precision is maintained using Prisma's Decimal type

## Modularity

The service is designed with clean separation:
- **Pure functions** for calculations (easily testable)
- **Database access** isolated to main function
- **Business logic** separated from infrastructure
- **Constants** exported for reference and testing

## Future Enhancements

Potential improvements:
- Caching of baseline coefficients
- Historical scoring tracking
- Score recalculation triggers
- Integration with eligibility services
- Export to reporting module
