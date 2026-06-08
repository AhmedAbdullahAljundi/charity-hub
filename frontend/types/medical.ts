export type AssistanceType = 'MONTHLY_MEDICAL' | 'MONTHLY_CASH' | 'SEASONAL_MIXED' | 'NONE'

export type AidType =
  | 'TREATMENT'
  | 'LAB_TEST'
  | 'IMAGING'
  | 'CONSULTATION'
  | 'SURGERY'
  | 'FINANCIAL_AID'
  | 'MARRIAGE_AID'

export type DisbursementStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED'

export type EligibilityStatus = 'مقبول' | 'مرفوض' | 'قيد_المراجعة' | 'استثناء'

export type DisbursementType = 'شهري' | 'موسمي' | 'زواج'

export type RelationshipType = 'الزوج' | 'الزوجة' | 'ابن' | 'ابنة' | 'والد' | 'والدة' | 'أخ' | 'أخت' | 'أخرى'

export interface MedicalRecord {
  id: string
  recordNumber: string
  classification: string
  husbandName: string
  wifeName: string
  patientRelationship: RelationshipType
  patientName: string
  disease: string
  doctorName: string
  treatmentCost: number
  disbursementType: DisbursementType
  recordDate: string
  lastDisbursementDate?: string
  notes: string
  eligibilityStatus: EligibilityStatus
  eligibilityReason: string
  previousDisbursements: {
    date: string
    amount: number
    type: DisbursementType
  }[]
}

export interface EligibilityCheck {
  isEligible: boolean
  status: EligibilityStatus
  reason: string
  conditions: {
    label: string
    passed: boolean
  }[]
}

export type EligibilityLevel =
  | 'pending'
  | 'OK'
  | 'WARNING'
  | 'BLOCKED'
  | 'fully_eligible'
  | 'partial_eligible'
  | 'not_eligible'

export interface Person {
  id: string
  name: string
  gender: 'MALE' | 'FEMALE'
  birthDate: string
  role?: 'HEAD' | 'SPOUSE' | 'CHILD' | 'DEPENDENT_ADULT' | 'INDEPENDENT' | 'OTHER'
  isBride?: boolean
  isOrphan?: boolean
}

export interface Household {
  id: string
  code: string
  headName?: string
  spouseName?: string
  primaryPhone?: string
  assistanceType?: AssistanceType
  normalizedPercent?: number
  eligibilityLevel?: string
  persons: Person[]
}

export interface MedicalCase {
  id: string
  householdId: string
  personId: string
  personName: string
  personGender: 'MALE' | 'FEMALE'
  personBirthDate: string
  householdCode: string
  headName: string
  assistanceType?: AssistanceType
  normalizedPercent?: number
  conditionName: string
  isCritical: boolean
  isActive: boolean
  estimatedMonthlyCost?: number
  doctorName?: string
  hospitalName?: string
  startDate?: string
  notes?: string
  disbursements: MedicalDisbursement[]
  lastDisbursementDate?: string
  nextEligibleDate?: string
  createdAt: string
}

export interface MedicalDisbursement {
  id: string
  householdId: string
  personId: string
  personName: string
  medicalCaseId?: string
  aidType: AidType
  amount: number
  totalCost?: number
  coveragePercent?: number
  isCriticalOverride: boolean
  isRetroactive: boolean
  disbursementDate: string
  status: DisbursementStatus
  approvedByName?: string
  notes?: string
  createdAt: string
}

export interface EligibilityResult {
  isEligible: boolean
  warningLevel: 'OK' | 'WARNING' | 'BLOCKED'
  message?: string | null
  nextEligibleDate?: string
  cooldownDays: number
  appliedCap?: number | null
  isCriticalOverride?: boolean
  requiresSupervisor?: boolean
  percentageWarning?: string | null
  assistanceType?: AssistanceType
  lastDisbursementDate?: string | null
  normalizedPercent?: number | null
}

export interface MedicalSummary {
  counts: {
    consultation: number
    labTest: number
    imaging: number
    treatment: number
    surgery: number
    financialAid: number
    marriageAid: number
  }
  amounts: {
    consultation: number
    labTest: number
    imaging: number
    treatment: number
    surgery: number
    financialAid: number
    marriageAid: number
    total: number
  }
  hasUnverifiedDisbursements: boolean
  lastDisbursementDate?: string | null
}
