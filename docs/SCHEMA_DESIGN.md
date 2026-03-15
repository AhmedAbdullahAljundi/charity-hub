# CharityHub - Database Schema Design

## Senior Data Architect - Normalized Schema

### Overview

This schema converts the legacy Excel-based charity system into a **fully normalized** PostgreSQL structure. It eliminates:

- ❌ Duplicated child columns (Child1, Child2, ... Child6)
- ❌ Husband/Wife as separate columns
- ❌ Multiple income columns
- ❌ Medical data mixed with family rows
- ❌ Social status mixed with scoring
- ❌ Repeated national IDs

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌───────────────┐
│   Family    │──────<│   Person    │──────<│  MedicalCase  │
│             │   1:N │             │   1:N │               │
│ registration│       │ role_in_    │       │ disease_name  │
│ social_status       │ family      │       │ medical_category
│ address     │       │ national_id │       └───────────────┘
│ housing_type│       └──────┬──────┘
│ rent_value  │              │
└──────┬──────┘              │ 1:N
       │                     ▼
       │              ┌───────────────┐
       │      1:N     │EducationRecord│
       │       ┌─────>│               │
       │       │      │ school_name   │
       │       │      │ stage, grade  │
       │       │      │ memorization │
       │       │      └───────────────┘
       │       │
       ▼       ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Income    │  │ Assistance  │  │   Scoring   │
│             │  │             │  │             │
│ source_type │  │ assistance_ │  │ total_need  │
│ amount      │  │ type        │  │ vulnerability│
│ verified    │  │ provider    │  │ classification│
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## Relationships

### 1. Family → Person (1:N)

**One family has many persons** (husband, wife, children).

- `Person.family_id` → `Family.id`
- Cascade delete: Deleting family removes all persons
- **Eliminates:** Husband, Wife, Child1..Child6 columns

### 2. Person → MedicalCase (1:N)

**One person can have multiple medical conditions.**

- `MedicalCase.person_id` → `Person.id`
- Cascade delete: Deleting person removes medical cases
- **Eliminates:** Medical columns mixed with family data

### 3. Person → EducationRecord (1:N)

**One person can have multiple education records** (e.g., different years).

- `EducationRecord.person_id` → `Person.id`
- Cascade delete: Deleting person removes education records
- **Eliminates:** Repeated grade/education columns

### 4. Family → Income (1:N)

**One family has multiple income sources.**

- `Income.family_id` → `Family.id`
- **Eliminates:** Income1, Income2, ... columns

### 5. Family → Assistance (1:N)

**One family receives multiple assistance records.**

- `Assistance.family_id` → `Family.id`
- Tracks distributions, donations, grants

### 6. Family → Scoring (1:N)

**One family has multiple scoring snapshots** (historical).

- `Scoring.family_id` → `Family.id`
- Latest record = current PMT score
- **Optimized for:** PMT scoring queries

---

## Model Details

### Family
| Field | Type | Purpose |
|-------|------|---------|
| id | UUID | Primary key |
| registration_number | String (unique) | Legacy Excel ID / Case number |
| social_status | Enum | Orphans, Divorced, Poor, etc. |
| address | String | Full address |
| region | String | Geographic region |
| housing_type | Enum | OWNED, RENT, SHARED |
| rent_value | Decimal | Monthly rent amount |
| phone | String | Contact phone |
| notes | String | Free text |

### Person
| Field | Type | Purpose |
|-------|------|---------|
| id | UUID | Primary key |
| family_id | UUID | FK to Family |
| full_name | String | Full name |
| national_id | String (unique) | National ID - no duplicates |
| role_in_family | Enum | HUSBAND, WIFE, CHILD, OTHER |
| gender | Enum | MALE, FEMALE |
| birth_date | Date | For age calculation |
| marital_status | Enum | SINGLE, MARRIED, etc. |
| education_level | Enum | NONE, PRIMARY, etc. |
| occupation | String | Job description |
| smoker | Boolean | PMT penalty |
| disability | Boolean | PMT bonus |
| deceased | Boolean | Head deceased = 0.9 |
| death_year | Int | For records |

### Income
| Field | Type | Purpose |
|-------|------|---------|
| id | UUID | Primary key |
| family_id | UUID | FK to Family |
| source_type | Enum | SALARY, PENSION, NAFAKA, etc. |
| amount | Decimal | Monthly amount |
| verified | Boolean | Documented/verified |
| notes | String | Source details |

### MedicalCase
| Field | Type | Purpose |
|-------|------|---------|
| id | UUID | Primary key |
| person_id | UUID | FK to Person |
| disease_name | String | Disease name |
| disease_severity | Enum | MILD, MODERATE, SEVERE |
| chronic | Boolean | Affects service interval |
| medical_category | Enum | A, B, C, D (PMT) |
| doctor_name | String | Treating doctor |
| treatment_cost | Decimal | Monthly cost |
| last_service_date | Date | Eligibility calc |
| next_allowed_date | Date | Service interval |

### EducationRecord
| Field | Type | Purpose |
|-------|------|---------|
| id | UUID | Primary key |
| person_id | UUID | FK to Person |
| school_name | String | Institution |
| stage | Enum | PRIMARY, SECONDARY, etc. |
| grade | String | Grade level |
| academic_status | Enum | ENROLLED, DROPPED, etc. |
| memorization_level | String | Quran memorization |

### Assistance
| Field | Type | Purpose |
|-------|------|---------|
| id | UUID | Primary key |
| family_id | UUID | FK to Family |
| assistance_type | Enum | FINANCIAL, FOOD, etc. |
| provider_name | String | Who gave it |
| amount | Decimal | Value |
| date | DateTime | When given |

### Scoring
| Field | Type | Purpose |
|-------|------|---------|
| id | UUID | Primary key |
| family_id | UUID | FK to Family |
| total_need | Decimal | Weighted need |
| total_income | Decimal | Actual income |
| vulnerability_index | Decimal | PMT ratio |
| classification | Enum | VERY_FRAGILE, etc. |
| breakdown | JSON | Coefficient details |
| calculated_at | DateTime | Snapshot time |

---

## PMT Scoring Optimization

### Indexes for Scoring Queries

```sql
-- Fast family lookup by classification
@@index([classification]) ON scorings

-- Range queries on vulnerability
@@index([vulnerability_index]) ON scorings

-- Latest score per family
@@index([family_id, calculated_at]) ON scorings
```

### Indexes for Person Queries

```sql
-- Age-based coefficient (birth_date)
@@index([birth_date]) ON persons

-- Role filtering (head, spouse, children)
@@index([role_in_family]) ON persons

-- National ID uniqueness
@@unique([national_id]) ON persons
```

---

## Migration from Legacy Excel

### Mapping Old → New

| Old Excel Column | New Location |
|------------------|--------------|
| Husband name | Person (role=HUSBAND) |
| Wife name | Person (role=WIFE) |
| Child 1..6 | Person (role=CHILD) × N |
| Income 1, 2, 3 | Income rows |
| Medical columns | MedicalCase (per person) |
| Education columns | EducationRecord |
| Social status | Family.social_status |
| National ID | Person.national_id (unique) |

### Data Migration Script (Conceptual)

```javascript
// For each Excel row:
// 1. Create Family (registration_number, address, etc.)
// 2. Create Person for husband
// 3. Create Person for wife
// 4. Create Person for each child (loop 1..6, skip empty)
// 5. Create Income rows for each income source
// 6. Create MedicalCase for each person with medical data
// 7. Create EducationRecord for each student
```

---

## Enums Reference

| Enum | Values |
|------|--------|
| RoleInFamily | HUSBAND, WIFE, CHILD, OTHER |
| HousingType | OWNED, RENT, SHARED |
| IncomeSourceType | SALARY, PENSION, AID, NAFAKA, FAMILY_SUPPORT, CHARITY, TAKAFUL_KARAMA, PROJECT, PROPERTY, CHILDREN_INCOME, RATION_CARD, OTHER |
| MedicalCategory | A, B, C, D |
| DiseaseSeverity | MILD, MODERATE, SEVERE, CRITICAL |
| AssistanceType | FINANCIAL, FOOD, CLOTHING, MEDICAL, EDUCATION, IN_KIND |
| VulnerabilityClassification | VERY_FRAGILE, FRAGILE, WEAK, MODERATE, OUT_OF_PRIORITY |
| SocialStatus | ORPHANS, DIVORCED, POOR, NEEDY, DISABILITY, STUDENT, PRISONER, ELDERLY, ABANDONMENT, CHRONIC_DISEASE, TEMPORARY_INJURY, OTHER |

---

## Scalability Notes

1. **No repeated columns** - Add new children by inserting Person rows
2. **Income sources** - Unlimited via Income table
3. **Medical history** - Multiple MedicalCase per person
4. **Scoring history** - Scoring table keeps snapshots
5. **Partitioning** - AuditLog can be partitioned by timestamp
6. **Read replicas** - Scoring queries can use read replica

---

## Migration

### Applying the Schema

**Option A: Fresh Start (no existing data)**
```bash
npx prisma migrate reset
```

**Option B: With Existing Data**
```bash
# Backup first!
pg_dump charityhub > backup.sql

# Apply migration
npx prisma migrate deploy
```

The migration will:
1. Create new tables (persons, incomes, medical_cases, education_records, assistances, scorings)
2. Migrate data from members→persons, income_sources→incomes, etc.
3. Alter families table (add registration_number, social_status, region, rent_value)
4. Drop old tables (members, income_sources, expenses, medical_records, educational_tracking)

### Post-Migration

1. Update backend controllers to use new models (Person, Income, MedicalCase, etc.)
2. Update frontend API calls
3. Run `npx prisma generate`
4. Seed ScoringRule coefficients
