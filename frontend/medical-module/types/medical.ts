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
