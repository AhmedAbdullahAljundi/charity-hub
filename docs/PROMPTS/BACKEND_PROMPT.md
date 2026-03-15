# Backend Development Prompt - CharityHub

## System Context
You are a Principal Backend Architect building a production-grade charity management system called "CharityHub" for a charitable organization in Egypt.

## Project Overview
CharityHub is a comprehensive Node.js backend system for managing beneficiaries, donors, volunteers, and staff workflows. The system handles complex PMT (Proxy Means Test) scoring, medical eligibility, educational tracking, and financial assistance distribution.

## Technical Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: JavaScript (NOT TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **Error Handling**: Custom error classes
- **Logging**: Winston (optional)

## Architecture Pattern: Clean Architecture

```
backend/
  src/
    config/          # Configuration files
      env.js         # Environment variables
      prisma.js      # Prisma client
      database.js    # Database connection
    middleware/      # Express middleware
      auth.js        # Authentication middleware
      rbac.js        # Role-based access control
      errorHandler.js
      validator.js
      audit.js       # Audit logging
    modules/         # Feature modules
      families/
        families.controller.js
        families.service.js
        families.routes.js
        families.validator.js
      members/
      income/
      expenses/
      medical/
      education/
      scoring/
      auth/
    services/        # Business logic services
      scoring/
        scoringService.js      # PMT calculation
      eligibility/
        medicalEligibilityService.js
      distribution/
        distributionService.js
    utils/           # Utility functions
      errors.js      # Custom error classes
      password.js    # Password hashing
      arabicMessages.js
    routes/          # Route aggregators
      api.v1.js
    app.js           # Express app setup
    server.js        # Server entry point
```

## Database Schema (Prisma)

### Core Models

```prisma
model Family {
  id           String   @id @default(uuid())
  national_id  String   @unique
  phone        String?
  head_name    String
  address      String
  housing_type HousingType
  classification_code Int?  // 1=Sponsorship, 2=Disability, etc.
  status       FamilyStatus  // PENDING, APPROVED, REJECTED, etc.
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt
  
  members       Member[]
  incomeSources IncomeSource[]
  expenses      Expense[]
  medicalRecords MedicalRecord[]
  educationalTracks EducationalTracking[]
  distributions Distribution[]
  fieldResearches FieldResearch[]
  
  @@index([national_id])
  @@index([phone])
  @@index([status])
  @@index([classification_code])
}

model Member {
  id                String   @id @default(uuid())
  family_id         String
  full_name         String
  national_id       String?  @unique
  age               Int
  gender            Gender
  education_level   EducationLevel
  employment_status EmploymentStatus?
  employment_type   EmploymentType?  // REGULAR, IRREGULAR, TRAVELING
  smoker            Boolean  @default(false)
  disability        Boolean  @default(false)
  disability_level  DisabilityLevel?
  chronic_disease   Boolean  @default(false)
  disease_category  MedicalCategory?
  relationship      Relationship  // HEAD, SPOUSE, CHILD, PARENT, etc.
  created_at        DateTime @default(now())
  
  family            Family   @relation(fields: [family_id], references: [id], onDelete: Cascade)
  medicalRecords    MedicalRecord[]
  educationalTracks EducationalTracking[]
  
  @@index([family_id])
  @@index([age])
  @@index([gender])
}

model IncomeSource {
  id         String     @id @default(uuid())
  family_id String
  type       IncomeType
  source     String     // Specific source name
  amount     Decimal    @db.Decimal(12, 2)
  verified   Boolean    @default(false)
  notes      String?
  created_at DateTime   @default(now())
  
  family     Family     @relation(fields: [family_id], references: [id], onDelete: Cascade)
  
  @@index([family_id])
  @@index([type])
  @@index([verified])
}

model Expense {
  id         String      @id @default(uuid())
  family_id  String
  type       ExpenseType
  amount     Decimal     @db.Decimal(12, 2)
  frequency  Frequency   // MONTHLY, SEASONAL, ONE_TIME
  notes      String?
  created_at DateTime    @default(now())
  
  family     Family      @relation(fields: [family_id], references: [id], onDelete: Cascade)
  
  @@index([family_id])
  @@index([type])
}

model MedicalRecord {
  id                String          @id @default(uuid())
  member_id         String
  medical_category  MedicalCategory
  disease_name      String
  chronic           Boolean         @default(false)
  last_service_date DateTime?
  next_allowed_date DateTime?
  service_interval  Int             // Days between services
  created_at        DateTime        @default(now())
  
  member            Member          @relation(fields: [member_id], references: [id], onDelete: Cascade)
  services          MedicalService[]
  
  @@index([member_id])
  @@index([medical_category])
  @@index([chronic])
}

model MedicalService {
  id                String          @id @default(uuid())
  medical_record_id String
  service_type      ServiceType     // VISIT, TEST, TREATMENT, XRAY
  center_name       String
  doctor_name       String?
  price             Decimal         @db.Decimal(10, 2)
  service_date      DateTime        @default(now())
  notes             String?
  
  medicalRecord     MedicalRecord   @relation(fields: [medical_record_id], references: [id], onDelete: Cascade)
  
  @@index([medical_record_id])
  @@index([service_date])
}

model EducationalTracking {
  id               String   @id @default(uuid())
  member_id        String
  school_name      String
  grade_level      String
  enrollment_year  Int
  performance_score Float?
  dropout_risk     Boolean  @default(false)
  quran_level      String?  // Current surah
  quran_progress   Float?   // Percentage
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt
  
  member           Member   @relation(fields: [member_id], references: [id], onDelete: Cascade)
  
  @@index([member_id])
  @@index([dropout_risk])
}

model Distribution {
  id                String            @id @default(uuid())
  family_id         String
  distribution_type DistributionType  // FINANCIAL, FOOD, CLOTHING, IN_KIND
  amount            Decimal?          @db.Decimal(10, 2)
  items             Json?             // For in-kind distributions
  distribution_date DateTime          @default(now())
  notes             String?
  
  family            Family            @relation(fields: [family_id], references: [id], onDelete: Cascade)
  
  @@index([family_id])
  @@index([distribution_type])
  @@index([distribution_date])
}

model FieldResearch {
  id                String   @id @default(uuid())
  family_id         String
  researcher_id     String
  research_date     DateTime @default(now())
  findings          Json     // Structured findings
  recommendations   String?
  verified          Boolean  @default(false)
  
  family            Family   @relation(fields: [family_id], references: [id], onDelete: Cascade)
  researcher        User     @relation(fields: [researcher_id], references: [id])
  
  @@index([family_id])
  @@index([researcher_id])
}

model ScoringRule {
  id          String   @id @default(uuid())
  rule_key    String   @unique
  coefficient Float
  description String?
  active      Boolean  @default(true)
  
  @@index([active])
}

// Enums
enum HousingType { OWNED, RENT, SHARED }
enum Gender { MALE, FEMALE }
enum EducationLevel { NONE, NURSERY, PRIMARY, PREPARATORY, SECONDARY, UNIVERSITY }
enum IncomeType { SALARY, PENSION, AID, FAMILY_SUPPORT, CHARITY, PROJECT, PROPERTY, OTHER }
enum ExpenseType { RENT, UTILITIES, FOOD, MEDICAL, EDUCATION, MARRIAGE }
enum MedicalCategory { A, B, C, D }
enum DisabilityLevel { A, B, C, D }
enum EmploymentStatus { EMPLOYED, UNEMPLOYED, STUDENT, RETIRED }
enum EmploymentType { REGULAR, IRREGULAR, TRAVELING, NONE }
enum Relationship { HEAD, SPOUSE, CHILD, PARENT, OTHER }
enum FamilyStatus { PENDING, UNDER_REVIEW, APPROVED, REJECTED, ACTIVE, INACTIVE }
enum Frequency { MONTHLY, SEASONAL, ONE_TIME }
enum ServiceType { VISIT, TEST, TREATMENT, XRAY }
enum DistributionType { FINANCIAL, FOOD, CLOTHING, IN_KIND }
```

## API Design

### RESTful Endpoints

```
GET    /api/v1/families              # List families (with filters)
GET    /api/v1/families/:id           # Get family details
POST   /api/v1/families               # Create family
PUT    /api/v1/families/:id           # Update family
DELETE /api/v1/families/:id           # Delete family
GET    /api/v1/families/:id/score     # Get PMT score
GET    /api/v1/families/:id/members   # Get family members
POST   /api/v1/families/:id/members   # Add member
GET    /api/v1/families/:id/income    # Get income sources
POST   /api/v1/families/:id/income    # Add income source
GET    /api/v1/families/:id/expenses  # Get expenses
POST   /api/v1/families/:id/expenses  # Add expense
GET    /api/v1/families/:id/medical   # Get medical records
POST   /api/v1/families/:id/medical   # Add medical record
GET    /api/v1/families/:id/education # Get educational tracking
POST   /api/v1/families/:id/education # Add educational record
GET    /api/v1/families/search         # Search families

GET    /api/v1/members/:id
PUT    /api/v1/members/:id
DELETE /api/v1/members/:id

GET    /api/v1/medical/services/:id
POST   /api/v1/medical/services
GET    /api/v1/medical/eligibility/:familyId

GET    /api/v1/scoring/:familyId
GET    /api/v1/scoring/rules
PUT    /api/v1/scoring/rules/:id

GET    /api/v1/distributions
POST   /api/v1/distributions
GET    /api/v1/distributions/export  # Excel export

GET    /api/v1/reports/:type
GET    /api/v1/reports/export

GET    /api/v1/audit
GET    /api/v1/audit/:id

POST   /api/v1/auth/login
GET    /api/v1/auth/me
POST   /api/v1/auth/logout
```

## Business Logic Services

### PMT Scoring Service

```javascript
// services/scoring/scoringService.js

/**
 * Calculate family PMT score
 * @param {string} familyId - Family ID
 * @returns {Object} Score breakdown and classification
 */
async function calculateFamilyScore(familyId) {
  // 1. Fetch family data with all relations
  // 2. Calculate head coefficient (by age)
  // 3. Calculate adult coefficients
  // 4. Calculate children coefficients (by age and education)
  // 5. Calculate disease coefficients
  // 6. Calculate disability coefficients
  // 7. Calculate housing coefficients
  // 8. Calculate family status coefficients
  // 9. Calculate employment coefficients (negative)
  // 10. Sum all coefficients
  // 11. Calculate estimated living standard
  // 12. Calculate actual living standard
  // 13. Calculate vulnerability index
  // 14. Classify family
  // 15. Return structured result
}

/**
 * Get baseline coefficient from database
 */
async function getBaselineCoefficient() {
  const rule = await prisma.scoringRule.findUnique({
    where: { rule_key: 'BASELINE_COEFFICIENT' }
  })
  return rule?.coefficient || 5000
}
```

### Medical Eligibility Service

```javascript
// services/eligibility/medicalEligibilityService.js

/**
 * Evaluate medical eligibility for family
 * @param {string} familyId - Family ID
 * @returns {Object} Eligibility status and next allowed dates
 */
async function evaluateFamilyMedicalEligibility(familyId) {
  // 1. Fetch family with members and medical records
  // 2. For each member with medical record:
  //    - Check category (A: 90 days, B: 60 days, C: 30 days)
  //    - If chronic: reduce interval by 10 days
  //    - Calculate next_allowed_date
  //    - Check if eligible (current date >= next_allowed_date)
  // 3. Return overall eligibility status
  // 4. Return member-level eligibility
}
```

## Authentication & Authorization

### JWT Token Structure
```javascript
{
  userId: string,
  email: string,
  role: string,
  permissions: string[],
  iat: number,
  exp: number
}
```

### RBAC Middleware
```javascript
// middleware/rbac.js

function requirePermission(permissionName) {
  return (req, res, next) => {
    if (!req.user?.permissions?.includes(permissionName)) {
      throw new ForbiddenError('Insufficient permissions')
    }
    next()
  }
}

function requireRole(roleName) {
  return (req, res, next) => {
    if (req.user?.role !== roleName) {
      throw new ForbiddenError('Insufficient role')
    }
    next()
  }
}
```

## Error Handling

### Custom Error Classes
```javascript
// utils/errors.js

class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message)
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.isOperational = true
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

class ForbiddenError extends AppError {
  constructor(message) {
    super(message || 'Forbidden', 403, 'FORBIDDEN')
  }
}
```

### Error Handler Middleware
```javascript
// middleware/errorHandler.js

function errorHandler(err, req, res, next) {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.errorCode
      }
    })
  }
  
  // Log unexpected errors
  console.error('Unexpected error:', err)
  
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }
  })
}
```

## Validation

### Joi Schemas
```javascript
// modules/families/families.validator.js

const createFamilySchema = Joi.object({
  head_name: Joi.string().min(2).max(100).required(),
  national_id: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
  phone: Joi.string().pattern(/^[0-9]+$/).optional(),
  address: Joi.string().min(5).max(500).required(),
  housing_type: Joi.string().valid('OWNED', 'RENT', 'SHARED').required(),
})
```

## Audit Logging

```javascript
// middleware/audit.js

async function auditLog(req, res, next) {
  const originalSend = res.json
  
  res.json = function(data) {
    if (req.method !== 'GET' && req.user) {
      AuditLog.create({
        table_name: req.route.path,
        record_id: req.params.id || data?.data?.id,
        action: req.method === 'POST' ? 'CREATE' : req.method === 'PUT' ? 'UPDATE' : 'DELETE',
        changed_by: req.user.id,
        old_data: req.body,
        new_data: data
      })
    }
    return originalSend.call(this, data)
  }
  
  next()
}
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/charityhub

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# PMT
BASELINE_COEFFICIENT=5000

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Testing

- Unit tests for services
- Integration tests for API endpoints
- Test database for integration tests
- Mock external services

## Security Best Practices

1. **Input Validation**: Validate all inputs
2. **SQL Injection**: Use Prisma (parameterized queries)
3. **XSS**: Sanitize user inputs
4. **CSRF**: Use CSRF tokens
5. **Rate Limiting**: Implement rate limiting
6. **Helmet**: Use helmet for security headers
7. **Password**: Hash with bcrypt (salt rounds: 10)
8. **JWT**: Use secure, random secret key
9. **CORS**: Configure properly
10. **Environment Variables**: Never commit .env files

## Performance Optimization

1. **Database Indexing**: Add indexes on frequently queried fields
2. **Query Optimization**: Use Prisma select to limit fields
3. **Caching**: Implement Redis for frequently accessed data
4. **Pagination**: Always paginate large datasets
5. **Connection Pooling**: Configure Prisma connection pool

## Logging

```javascript
// Use Winston or similar
const logger = {
  info: (message) => console.log(`[INFO] ${message}`),
  error: (message) => console.error(`[ERROR] ${message}`),
  warn: (message) => console.warn(`[WARN] ${message}`),
}
```

## Deployment

1. Use PM2 or similar process manager
2. Set up health check endpoint
3. Implement graceful shutdown
4. Use environment-specific configs
5. Set up monitoring and alerts

## Code Style

- Use async/await (not callbacks)
- Use descriptive variable names
- Comment complex business logic
- Follow ESLint rules
- Use Prettier for formatting
